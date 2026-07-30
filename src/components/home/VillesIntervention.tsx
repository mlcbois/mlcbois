import { MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

/**
 * Bande de villes desservies, entre le hero et la barre de réassurance.
 *
 * Communes des zones A et B (voir « lieferung » dans les messages) : celles où
 * la livraison se fait avec notre propre remorque. La zone C part par
 * transporteur — ce n'est pas une intervention au même sens, elle n'y figure
 * donc pas.
 *
 * Les noms de commune ne se traduisent pas ; seul le libellé qui les précède
 * change de langue.
 */
const VILLES = [
  "Paris",
  "Boulogne-Billancourt",
  "Nanterre",
  "Saint-Denis",
  "Créteil",
  "Vincennes",
  "Montreuil",
  "Vitry-sur-Seine",
  "Antony",
  "Rueil-Malmaison",
  "Versailles",
  "Melun",
  "Évry-Courcouronnes",
  "Cergy",
  "Meaux",
  "Rambouillet",
  "Fontainebleau",
  "Corbeil-Essonnes",
  "Chartres",
  "Mantes-la-Jolie",
] as const;

/** Piste doublée : la seconde moitié reprend exactement la première, ce qui
 * rend la boucle de -50 % imperceptible plutôt que de sauter. */
const PISTE = [...VILLES, ...VILLES];

function VilleItem({ ville }: { ville: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2 text-xs font-semibold tracking-wide text-white/75">
      <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-primary" />
      {ville}
    </span>
  );
}

export async function VillesIntervention() {
  const t = await getTranslations("interventions");
  const locale = await getLocale();

  // Liste grammaticalement correcte selon la langue : « Paris, Melun et
  // Chartres » en français, « Paris, Melun and Chartres » en anglais.
  const villesLisibles = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(VILLES);

  return (
    <section className="border-b border-white/10 bg-[#150e0b]">
      <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-2.5 sm:px-6">
        <span className="hidden shrink-0 items-center gap-1.5 text-[0.7rem] font-bold tracking-wide text-white/55 uppercase sm:flex">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {t("label")}
        </span>

        {/* Piste défilante, purement décorative : un résumé lisible par lecteur
            d'écran la remplace, plutôt que de faire lire une liste doublée qui
            boucle à l'infini. */}
        <div
          className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          aria-hidden="true"
        >
          <div className="marquee-track flex w-max gap-8 py-0.5 whitespace-nowrap">
            {PISTE.map((ville, index) => (
              <VilleItem key={`${ville}-${index}`} ville={ville} />
            ))}
          </div>
        </div>

        <p className="sr-only">{t("srListe", { villes: villesLisibles })}</p>
      </div>
    </section>
  );
}
