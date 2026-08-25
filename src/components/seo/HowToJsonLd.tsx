import { JsonLd, type JsonLdValue } from "@/components/seo/JsonLd";

// Balisage HowTo, à poser à côté d'une suite d'étapes numérotées déjà visible
// sur la page. Comme pour BreadcrumbJsonLd, les étapes doivent refléter
// exactement ce qui s'affiche : Google compare le balisage à la page rendue.

export interface HowToJsonLdStep {
  name: string;
  text: string;
}

export function HowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description?: string;
  steps: HowToJsonLdStep[];
}) {
  if (steps.length === 0) return null;

  const step: JsonLdValue[] = steps.map((s, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: s.name,
    text: s.text,
  }));

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        step,
      }}
    />
  );
}
