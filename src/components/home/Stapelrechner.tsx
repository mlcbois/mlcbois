"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Le Stapelrechner : la pièce maîtresse de la page d'accueil.
 *
 * Acheter du bois se heurte toujours au même mur — personne ne sait à quoi
 * ressemblent « 3 mètres cubes apparents ». Le calculateur répond aux deux questions
 * en même temps : ce que ça coûte, livraison comprise, et le volume que ça
 * représente réellement, rappelé en stères et en kilos.
 */

// Prix au mètre cube apparent, hors livraison. Mêmes bases que le catalogue
// (scripts/seed-brennholz.ts) : une seule vérité de tarif.
const ESSENCES = [
  { key: "buche", preis: 92, href: "/brennholz/buche" },
  { key: "eiche", preis: 99, href: "/brennholz/eiche" },
  { key: "birke", preis: 95, href: "/brennholz/birke" },
  { key: "mix", preis: 79, href: "/brennholz/hartholz-mix" },
] as const;

// Supplément de fendage : plus la bûche est courte, plus il y a de coupes.
const LAENGEN = [
  { cm: 25, aufschlag: 12 },
  { cm: 33, aufschlag: 6 },
  { cm: 50, aufschlag: 0 },
] as const;

const MENGE_MIN = 1;
const MENGE_MAX = 12;
// À partir de six MAP, la livraison est offerte dans les zones A et B.
const FRANCO_A_PARTIR_DE = 6;

// Un mètre cube apparent de bois fendu vaut environ 0,7 stère empilé,
// et pèse à 18 % de reste d'humidité environ 420 kg pour du feuillu.
const STERE_PAR_MAP = 0.7;
const KILO_PAR_MAP = 420;

interface Zone {
  key: "a" | "b" | "c";
  kosten: number;
}

// Mêmes zones que la page « Livraison » (src/messages/*.json, namespace
// « lieferung ») : le département fait foi, pas une plage numérique qui
// ratisserait des départements hors zone.
const ZONE_A_DEPARTEMENTS = new Set(["75", "92", "93", "94"]);
const ZONE_B_DEPARTEMENTS = new Set(["77", "78", "91", "95", "60", "28"]);

/** Zone de livraison d'après les deux premiers chiffres du code postal. */
function zoneFuer(plz: string): Zone {
  // Code postal pas encore saisi : on ne pénalise pas d'un tarif zone C avant
  // que le client ait fini de taper.
  if (plz.length < 2) return { key: "a", kosten: 29 };
  const departement = plz.slice(0, 2);
  if (ZONE_A_DEPARTEMENTS.has(departement)) return { key: "a", kosten: 29 };
  if (ZONE_B_DEPARTEMENTS.has(departement)) return { key: "b", kosten: 49 };
  return { key: "c", kosten: 79 };
}

function euro(betrag: number): string {
  return `${betrag.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function Stapelrechner() {
  const t = useTranslations("rechner");
  const [essence, setEssence] = useState<(typeof ESSENCES)[number]["key"]>("buche");
  const [laenge, setLaenge] = useState<number>(33);
  const [menge, setMenge] = useState(3);
  const [plz, setPlz] = useState("");

  const berechnung = useMemo(() => {
    const holz = ESSENCES.find((item) => item.key === essence) ?? ESSENCES[0];
    const laengeInfo = LAENGEN.find((item) => item.cm === laenge) ?? LAENGEN[1];
    const prixParMap = holz.preis + laengeInfo.aufschlag;
    const ware = prixParMap * menge;

    const zone = zoneFuer(plz);
    const frei = menge >= FRANCO_A_PARTIR_DE && zone.key !== "c";
    const lieferung = frei ? 0 : zone.kosten;

    return {
      href: holz.href,
      prixParMap,
      ware,
      zone,
      frei,
      lieferung,
      gesamt: ware + lieferung,
      // Prix au MAP livraison comprise : c'est le chiffre qui permet de
      // comparer deux marchands, plus que le total de la commande.
      prixParMapTotal: (ware + lieferung) / menge,
      steres: menge * STERE_PAR_MAP,
      kilo: Math.round(menge * KILO_PAR_MAP),
    };
  }, [essence, laenge, menge, plz]);

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_24px_60px_-24px_rgba(27,19,16,0.55)]">
      <div className="flex items-baseline justify-between gap-3 bg-secondary px-5 py-2.5">
        <span className="eyebrow text-[0.7rem] text-primary">{t("titel")}</span>
        <span className="text-[0.72rem] text-white/60">{t("untertitel")}</span>
      </div>

      <div className="space-y-3.5 px-5 py-4">
        <Feld label={t("holzart")}>
          <div className="grid grid-cols-4 gap-1.5">
            {ESSENCES.map((item) => (
              <Chip
                key={item.key}
                active={item.key === essence}
                onClick={() => setEssence(item.key)}
                label={t(`essenzen.${item.key}`)}
                hint={`${item.preis} €`}
              />
            ))}
          </div>
        </Feld>

        <Feld label={t("scheitlaenge")}>
          <div className="grid grid-cols-3 gap-1.5">
            {LAENGEN.map((item) => (
              <Chip
                key={item.cm}
                active={item.cm === laenge}
                onClick={() => setLaenge(item.cm)}
                label={`${item.cm} cm`}
                mono
                hint={item.aufschlag === 0 ? t("ohneAufschlag") : `+${item.aufschlag} €`}
              />
            ))}
          </div>
        </Feld>

        <Feld label={t("menge")}>
          <div className="flex items-stretch gap-2">
            <div className="flex items-stretch overflow-hidden rounded-md border border-border">
              <button
                type="button"
                onClick={() => setMenge((value) => Math.max(MENGE_MIN, value - 1))}
                disabled={menge <= MENGE_MIN}
                aria-label={t("wenigerAria")}
                className="flex w-10 items-center justify-center bg-muted text-foreground transition-colors hover:bg-border disabled:opacity-35"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="messwert flex min-w-[5.5rem] items-baseline justify-center gap-1 px-2 text-xl font-bold">
                {menge}
                <span className="einheit text-foreground">MAP</span>
              </span>
              <button
                type="button"
                onClick={() => setMenge((value) => Math.min(MENGE_MAX, value + 1))}
                disabled={menge >= MENGE_MAX}
                aria-label={t("mehrAria")}
                className="flex w-10 items-center justify-center bg-muted text-foreground transition-colors hover:bg-border disabled:opacity-35"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <label className="flex min-w-0 flex-1 items-center rounded-md border border-border px-3">
              <span className="sr-only">{t("plz")}</span>
              <input
                value={plz}
                onChange={(event) => setPlz(event.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                placeholder={t("plzPlatzhalter")}
                className="messwert w-full bg-transparent text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground"
              />
            </label>
          </div>

          {/* Ce que représentent vraiment les mètres cubes apparents choisis */}
          <p className="mt-1.5 text-[0.72rem] text-muted-foreground">
            {t.rich("volumen", {
              rm: berechnung.steres.toLocaleString("fr-FR", { maximumFractionDigits: 1 }),
              kg: berechnung.kilo.toLocaleString("fr-FR"),
              wert: (chunks) => <span className="messwert text-foreground">{chunks}</span>,
            })}
          </p>
        </Feld>

        <div className="rounded-md bg-muted p-3.5">
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">
                <span className="messwert">{menge}</span> <span className="einheit">MAP</span> ×{" "}
                <span className="messwert">{euro(berechnung.prixParMap)}</span>
              </dt>
              <dd className="messwert font-medium">{euro(berechnung.ware)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="h-3.5 w-3.5" />
                {t(`zonen.${berechnung.zone.key}`)}
              </dt>
              <dd className={cn("messwert font-medium", berechnung.frei && "text-forst")}>
                {berechnung.frei ? t("frei") : euro(berechnung.lieferung)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
              <dt className="font-heading text-base font-bold">{t("gesamt")}</dt>
              <dd className="messwert text-2xl font-bold text-primary">{euro(berechnung.gesamt)}</dd>
            </div>
          </dl>

          {!berechnung.frei && berechnung.zone.key !== "c" && (
            <p className="mt-2.5 border-l-2 border-forst py-0.5 pl-2.5 text-[0.74rem] font-medium text-forst">
              {t("freiHinweis", { fehlt: FRANCO_A_PARTIR_DE - menge })}
            </p>
          )}
        </div>

        <Link
          href={berechnung.href}
          className="flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 font-heading text-base font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("cta", { holz: t(`essenzen.${essence}`) })}
        </Link>
        <p className="text-center text-[0.72rem] text-muted-foreground">{t("hinweis")}</p>

        {/* Accordéon HTML natif, comme la FAQ (HolzFaq) : se déplie sans
            JavaScript, reste accessible au clavier. Un seul volet, refermé par
            défaut — l'explication ne doit pas s'imposer avant le calcul. */}
        <details className="group rounded-md border border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {t("aideTitre")}
            <Plus
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p className="border-t border-border px-3.5 py-3 text-[0.74rem] leading-relaxed text-muted-foreground">
            {t("aideTexte")}
          </p>
        </details>
      </div>
    </div>
  );
}

function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-1.5 text-[0.6rem] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  hint,
  mono,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-xs leading-tight transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "border-secondary bg-secondary text-white"
          : "border-border bg-white text-foreground hover:border-secondary/40 hover:bg-muted",
      )}
    >
      <span className={cn("font-bold", mono && "messwert")}>{label}</span>
      <span className={cn("messwert text-[0.62rem]", active ? "text-primary" : "text-muted-foreground")}>
        {hint}
      </span>
    </button>
  );
}
