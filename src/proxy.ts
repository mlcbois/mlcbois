import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import {
  attendUneReponseJson,
  cheminToujoursAutorise,
  maintenanceActive,
} from "@/lib/maintenance";
import { PAGE_MAINTENANCE } from "@/lib/maintenancePage";
import { ATTRIBUTION_COOKIE, ATTRIBUTION_MAX_AGE_SECONDS, type TrafficAttribution } from "@/lib/attribution";

// Anciennement `middleware.ts` : Next 16 a renommé la convention en `proxy`.
// Le proxy tourne en runtime Node.js, ce qui permet d'y vérifier la signature
// de la session avec `node:crypto`, comme partout ailleurs dans le projet.

const routageMultilingue = createMiddleware(routing);

/**
 * Le back-office, les API, le flux Merchant et les routes de campagne et de
 * relance de panier restent hors du routage multilingue.
 *
 * Ces routes sont volontairement courtes — un lien de message doit rester
 * lisible et tenir sur une ligne — et n'ont pas de version par langue : /c et
 * /p ne renvoient qu'une redirection ou une image, /r restaure un panier
 * avant de renvoyer vers /panier, et /desinscription choisit sa langue
 * d'après le destinataire enregistré, pas d'après l'URL. Les faire passer par
 * le routage multilingue les réécrirait en /fr/c/... et casserait tous les
 * liens déjà partis dans les boîtes des clients.
 */
function horsRoutageMultilingue(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/feed") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/desinscription/") ||
    // Servis à la racine, sans version par langue : les faire passer par le
    // routage multilingue les réécrirait en /fr/sitemap.xml, qui n'existe pas.
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  );
}

/**
 * Une session valide suffit à traverser la maintenance. On ne vérifie que la
 * signature du jeton, pas l'existence du compte en base : ce serait une requête
 * de plus sur chaque page, et la maintenance est justement le moment où la base
 * peut être indisponible. Le jeton est signé et daté — il ne s'obtient pas sans
 * être passé par le mot de passe et le code à six chiffres.
 */
function administrateurConnecte(request: NextRequest): boolean {
  const jeton = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  try {
    return verifySessionToken(jeton) !== null;
  } catch {
    // ADMIN_SESSION_SECRET absente : personne ne peut être authentifié, et la
    // maintenance ne doit pas se lever pour autant.
    return false;
  }
}

function reponseMaintenance(pathname: string): NextResponse {
  // 503 plutôt que 200 : c'est la réponse qui dit aux moteurs de recherche
  // « revenez plus tard » au lieu de leur faire indexer la page d'attente à la
  // place de la boutique. `Retry-After` leur donne le délai en secondes.
  const entetes = {
    "Retry-After": "3600",
    "Cache-Control": "no-store",
  };

  if (attendUneReponseJson(pathname)) {
    return NextResponse.json(
      { error: "La boutique est en maintenance. Merci de réessayer dans quelques instants." },
      { status: 503, headers: entetes },
    );
  }

  return new NextResponse(PAGE_MAINTENANCE, {
    status: 503,
    headers: { ...entetes, "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Pose le cookie d'origine au premier atterrissage. Ne s'exécute que sur les
 * pages de la boutique elle-même (routage multilingue) : ce sont celles où un
 * visiteur arrive vraiment depuis une recherche, une pub ou un e-mail — pas
 * les appels d'API ou le back-office.
 *
 * Premier contact, pas dernier : un cookie déjà posé n'est jamais réécrit,
 * même si le visiteur revient plus tard par un autre canal. C'est ce qui rend
 * la donnée exploitable — sinon la dernière page vue avant achat écraserait
 * systématiquement l'annonce ou la recherche qui a fait découvrir la boutique.
 */
function poserAttributionSiAbsente(request: NextRequest, response: NextResponse): void {
  if (request.cookies.has(ATTRIBUTION_COOKIE)) return;

  const params = request.nextUrl.searchParams;
  let referrerHost = "";
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname !== request.nextUrl.hostname) {
        referrerHost = refererUrl.hostname;
      }
    } catch {
      // En-tête Referer malformé : ignoré, l'accès reste classé « direct ».
    }
  }

  const attribution: TrafficAttribution = {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    gclid: params.get("gclid") ?? "",
    referrerHost,
  };

  // Rien à retenir : ni paramètre de campagne, ni renvoi externe. Inutile de
  // poser un cookie pour ne conserver que des chaînes vides.
  if (Object.values(attribution).every((value) => value === "")) return;

  response.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(attribution), {
    maxAge: ATTRIBUTION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    maintenanceActive() &&
    !cheminToujoursAutorise(pathname) &&
    !administrateurConnecte(request)
  ) {
    return reponseMaintenance(pathname);
  }

  if (horsRoutageMultilingue(pathname)) {
    return NextResponse.next();
  }

  const response = routageMultilingue(request);
  poserAttributionSiAbsente(request, response);
  return response;
}

export const config = {
  // Plus large que le seul routage multilingue : la maintenance doit aussi
  // couvrir les API et le flux Merchant, sinon on pourrait encore passer
  // commande pendant que la vitrine affiche qu'elle est fermée. Le tri entre
  // les deux traitements se fait dans `proxy`, pas ici.
  //
  // Restent en dehors : les ressources internes de Next et tout chemin portant
  // une extension de fichier — images, polices, favicon. La page d'attente en a
  // besoin, et les exclure évite de faire tourner ce code sur chaque octet
  // statique.
  //
  // Le sitemap et le robots.txt portent une extension et tomberaient donc dans
  // cette exclusion : il faut les nommer un à un. Sans ça, une boutique fermée
  // continuerait de publier la liste complète de ses 166 pages.
  matcher: ["/((?!_next|_vercel|.*\\..*).*)", "/sitemap.xml", "/robots.txt"],
};
