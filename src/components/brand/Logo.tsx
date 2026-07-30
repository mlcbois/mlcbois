import { cn } from "@/lib/utils";

/**
 * Marque de la boutique.
 *
 * Le sigle est un empilement de trois rondins vus en bout : la silhouette
 * du tas est aussi celle d'une flamme. Les cernes ne sont pas décoratifs,
 * ils distinguent le cœur de l'aubier — c'est ce que le client regarde pour
 * juger un bois de chauffage.
 *
 * Le nom reste du texte : il suit les polices du site, se met à l'échelle
 * sans perte et reste lisible pour les lecteurs d'écran.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="presentation"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
    >
      <g fill="none">
        {/* Rondin du haut : la pointe de la flamme */}
        <circle cx="20" cy="12.5" r="8.2" fill="currentColor" />
        <circle cx="20" cy="12.5" r="4.6" className="fill-secondary" opacity="0.32" />
        <circle cx="20" cy="12.5" r="1.7" className="fill-secondary" opacity="0.5" />
        {/* Base : les deux rondins porteurs */}
        <circle cx="11.4" cy="27.4" r="8.2" fill="currentColor" />
        <circle cx="11.4" cy="27.4" r="4.6" className="fill-secondary" opacity="0.32" />
        <circle cx="11.4" cy="27.4" r="1.7" className="fill-secondary" opacity="0.5" />
        <circle cx="28.6" cy="27.4" r="8.2" fill="currentColor" />
        <circle cx="28.6" cy="27.4" r="4.6" className="fill-secondary" opacity="0.32" />
        <circle cx="28.6" cy="27.4" r="1.7" className="fill-secondary" opacity="0.5" />
      </g>
    </svg>
  );
}

interface LogoProps {
  /** "light" sur fond sombre (en-tête, pied de page), "dark" sur fond clair. */
  tone?: "light" | "dark";
  className?: string;
}

export function Logo({ tone = "light", className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className="h-9 w-9 shrink-0 text-primary sm:h-10 sm:w-10" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-[1.28rem] font-black tracking-[-0.03em] sm:text-[1.4rem]",
            tone === "light" ? "text-white" : "text-foreground",
          )}
        >
          MLC Bois
        </span>
        {/* Le descripteur annonce le métier, pas un slogan. Interlettrage
            resserré par rapport aux autres surtitres : à cette longueur, il
            passerait devant le nom lui-même. */}
        <span className="eyebrow mt-1 text-[0.54rem] tracking-[0.1em] text-primary">
          Bois de chauffage
        </span>
      </span>
    </span>
  );
}
