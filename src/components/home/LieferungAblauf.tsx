import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

/**
 * Livraison : le déroulé et les zones.
 *
 * Les trois étapes sont numérotées parce qu'elles le sont réellement — la
 * commande, le créneau, la dépose se suivent dans cet ordre et l'acheteur a
 * besoin de savoir où il en est. Ailleurs sur la page, rien n'est numéroté.
 */
const schritte = ["bestellung", "termin", "abladen"] as const;

// Départements, pas plages de codes postaux : une plage numérique ratisserait
// des départements hors zone. Mêmes ensembles que zoneFuer() dans
// Stapelrechner.tsx et que les mentions légales.
const zonen = [
  { key: "a", plz: "75 · 92 · 93 · 94", kosten: 29, tage: "48 h" },
  { key: "b", plz: "77 · 78 · 91 · 95 · 60 · 28", kosten: 49, tage: "3–5" },
  { key: "c", plz: "01 → 89", kosten: 79, tage: "5–8" },
] as const;

export async function LieferungAblauf() {
  const t = await getTranslations("lieferung");

  return (
    <section className="relative isolate overflow-hidden bg-secondary py-14 text-white sm:py-20">
      {/* La photo reste une texture de fond : assez présente pour rappeler la
          matière, assez discrète pour que le tableau des zones se lise. */}
      <Image
        src="/images/brennholz/lose-schuettung.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/70" />

      <div className="relative mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-3 text-primary">{t("eyebrow")}</p>
          <h2 className="font-heading text-3xl leading-tight font-black sm:text-[2.6rem]">
            {t("titel")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">{t("einleitung")}</p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-3">
          {schritte.map((schritt, index) => (
            <li key={schritt} className="border-t-2 border-primary/60 pt-4">
              <span className="messwert text-sm font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-heading text-lg font-bold">{t(`schritte.${schritt}.titel`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {t(`schritte.${schritt}.text`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 overflow-hidden rounded-lg border border-white/15">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 bg-white/5 px-4 py-3 sm:grid-cols-[1.4fr_1fr_auto_auto] sm:gap-x-6 sm:px-6">
            <span className="eyebrow text-[0.6rem] text-white/60">{t("tabelle.zone")}</span>
            <span className="eyebrow hidden text-[0.6rem] text-white/60 sm:block">
              {t("tabelle.plz")}
            </span>
            <span className="eyebrow text-right text-[0.6rem] text-white/60">
              {t("tabelle.dauer")}
            </span>
            <span className="eyebrow text-right text-[0.6rem] text-white/60">
              {t("tabelle.kosten")}
            </span>
          </div>

          {zonen.map((zone, index) => (
            <div
              key={zone.key}
              className={cn(
                "grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 px-4 py-4 sm:grid-cols-[1.4fr_1fr_auto_auto] sm:gap-x-6 sm:px-6",
                index > 0 && "border-t border-white/10",
              )}
            >
              <span>
                <span className="font-heading text-base font-bold">{t(`zonen.${zone.key}.name`)}</span>
                <span className="mt-0.5 block text-xs text-white/60">{t(`zonen.${zone.key}.gebiet`)}</span>
                <span className="messwert mt-1 block text-[0.7rem] text-white/50 sm:hidden">
                  {t("tabelle.plz")} {zone.plz}
                </span>
              </span>
              <span className="messwert hidden text-sm text-white/70 sm:block">{zone.plz}</span>
              <span className="messwert text-right text-sm text-white/70">{zone.tage}</span>
              <span className="messwert text-right text-base font-bold text-primary">
                {zone.kosten},00 €
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-white/60">{t("freiHinweis")}</p>
      </div>
    </section>
  );
}
