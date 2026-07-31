import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Marque de la boutique.
 *
 * Le logo est un cartouche horizontal de rapport deux pour un : un panneau
 * portant un arbre, puis le nom et la scène. Le nom y occupe près d'un
 * cinquième de la hauteur, ce qui le rend lisible dès 48 px — l'en-tête peut
 * donc rester compact.
 *
 * Deux fichiers, un par fond : le lettrage est brun sombre dans la version
 * d'origine, crème dans la version claire. Les recolorier en CSS n'est pas
 * possible sur un PNG, et un filtre d'inversion emporterait aussi les verts du
 * feuillage et l'orange de la flamme. Les deux fichiers sont produits par
 * scripts/generer-logos.mjs à partir du même original.
 */

/** Proportions du fichier source, après rognage. */
const LARGEUR_DE_REFERENCE = 439;
const HAUTEUR_DE_REFERENCE = 222;

interface LogoProps {
  /** "light" sur fond sombre (pied de page, back-office), "dark" sur fond clair. */
  tone?: "light" | "dark";
  className?: string;
  /**
   * Vrai pour le logo de l'en-tête, qui est le premier élément visible de la
   * page : Next.js le précharge alors au lieu de le charger paresseusement.
   */
  priority?: boolean;
}

export function Logo({ tone = "light", className, priority = false }: LogoProps) {
  return (
    <Image
      src={tone === "light" ? "/images/logo-full-light.png" : "/images/logo-full.png"}
      alt="MLC Bois — bois de chauffage & pellets"
      width={LARGEUR_DE_REFERENCE}
      height={HAUTEUR_DE_REFERENCE}
      priority={priority}
      className={cn("h-12 w-auto sm:h-14", className)}
    />
  );
}

/**
 * Panneau de l'arbre, cadré carré sur fond blanc. Pour les espaces où la
 * marque doit tenir dans un carré plutôt qu'occuper une largeur libre.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-icon.png"
      alt=""
      aria-hidden="true"
      width={266}
      height={266}
      className={cn("h-10 w-10", className)}
    />
  );
}
