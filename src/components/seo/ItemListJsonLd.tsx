import { JsonLd, type JsonLdValue } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/server/merchant";

// Balisage ItemList, posé sur une grille de produits déjà affichée (page
// catégorie). Décrit l'ordre et l'identité des fiches à Google, sans dupliquer
// le détail de chaque produit — déjà porté par son propre Product/Offer.

export interface ItemListJsonLdItem {
  name: string;
  /** Chemin interne ("/bois-de-chauffage/vrac/produit") ou URL absolue. */
  href: string;
}

export function ItemListJsonLd({ items }: { items: ItemListJsonLdItem[] }) {
  if (items.length === 0) return null;

  const itemListElement: JsonLdValue[] = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(item.href),
    name: item.name,
  }));

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement,
      }}
    />
  );
}
