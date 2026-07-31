import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Marque de la boutique.
 *
 * Le logo est un médaillon rond posé au-dessus du nom : une composition
 * verticale, presque carrée, et non un bandeau. Elle demande donc une hauteur
 * d'affichage bien plus généreuse qu'un logo en ligne — le nom n'occupe qu'un
 * dixième de la hauteur de l'image, il devient illisible en dessous de 56 px.
 *
 * Deux fichiers, un par fond : le lettrage est brun sombre dans la version
 * d'origine, crème dans la version claire. Les recolorier en CSS n'est pas
 * possible sur un PNG, et un filtre d'inversion emporterait aussi les verts du
 * feuillage et l'orange de la flamme. Les deux fichiers sont produits par
 * scripts/generer-logos.mjs à partir du même original.
 */

/** Proportions du fichier source, après rognage. */
const LARGEUR_DE_REFERENCE = 255;
const HAUTEUR_DE_REFERENCE = 284;

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
      // Le nom n'occupe qu'un dixième de la hauteur de l'image : sous 60 px il
      // devient illisible. 80 px sur grand écran est le point où il se lit sans
      // que l'en-tête ne double de hauteur ; 64 px sur téléphone, où la barre
      // est déjà à l'étroit.
      className={cn("h-16 w-auto sm:h-20", className)}
    />
  );
}

/**
 * Médaillon cadré carré sur fond blanc. Pour les espaces où le logo doit
 * tenir dans un carré plutôt qu'occuper une largeur libre.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-icon.png"
      alt=""
      aria-hidden="true"
      width={312}
      height={312}
      className={cn("h-10 w-10", className)}
    />
  );
}
