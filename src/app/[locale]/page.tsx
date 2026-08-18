import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroBrennholz } from "@/components/home/HeroBrennholz";
import { VillesIntervention } from "@/components/home/VillesIntervention";
import { TrustStrip } from "@/components/home/TrustStrip";
import { SortimentGrid, type SortimentKarte } from "@/components/home/SortimentGrid";
import { RestfeuchteSkala } from "@/components/home/RestfeuchteSkala";
import { HolzartenVergleich } from "@/components/home/HolzartenVergleich";
import { LieferungAblauf } from "@/components/home/LieferungAblauf";
import { HolzFaq } from "@/components/home/HolzFaq";
import { ProductGrid } from "@/components/ProductGrid";
import { alternatesFor, openGraphFor } from "@/lib/hreflang";
import { formatPrice, getCategoryPages, type CategoryPageView } from "@/server/store";
import { loadCatalogTranslations, localizeCategoryPages } from "@/server/localizedContent";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/types/home";

type HomeParams = Promise<{ locale: Locale }>;

// Seuls ces deux groupes composent la boutique bois. Le filtre est explicite
// pour que d'anciennes catégories restées en base n'apparaissent pas.
const GRUPPEN = ["bois-de-chauffage", "equipement"];

/** Prix d'entrée d'une catégorie, formaté à la française. */
function abPreis(category: CategoryPageView): string {
  const cents = category.products
    .map((product) => product.priceCents ?? 0)
    .filter((value) => value > 0);
  return cents.length > 0 ? formatPrice(Math.min(...cents)) : "";
}

/**
 * Sélection mise en avant : un seul article par catégorie, sinon la grille se
 * remplirait de six longueurs du même hêtre. Le décalage par l'index fait
 * varier les longueurs et les conditionnements d'une carte à l'autre — deux
 * palettes de 33 cm côte à côte n'apprennent rien à personne.
 */
function bestseller(categories: CategoryPageView[], limit: number): Product[] {
  return categories
    .map((category, index) => {
      if (category.products.length === 0) return undefined;
      const markiert = category.products.find((product) => product.badge);
      return markiert ?? category.products[index % category.products.length];
    })
    .filter((product): product is Product => product !== undefined)
    .slice(0, limit);
}

export async function generateMetadata({ params }: { params: HomeParams }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: alternatesFor("/", locale),
    ...openGraphFor({ href: "/", locale, title, description }),
  };
}

export default async function Home({ params }: { params: HomeParams }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  const [rawCategories, translations] = await Promise.all([
    getCategoryPages(),
    loadCatalogTranslations(locale),
  ]);
  const categories = localizeCategoryPages(rawCategories, translations).filter(
    (category) => GRUPPEN.includes(category.group) && category.products.length > 0,
  );

  const karten: SortimentKarte[] = categories.map((category) => ({
    slug: category.slug,
    href: `/${category.group}/${category.slug}`,
    label: category.label,
    image: category.image,
    abPreis: abPreis(category),
    anzahl: category.products.length,
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroBrennholz />
        <VillesIntervention />
        <TrustStrip />
        <SortimentGrid karten={karten} />
        <RestfeuchteSkala />

        {/* La section précédente est déjà blanche : on ne rajoute que la
            respiration nécessaire, pas un second bloc de padding. */}
        <div className="bg-white pb-14 sm:pb-20">
          <ProductGrid
            eyebrow={t("bestsellerEyebrow")}
            heading={t("bestseller")}
            ctaLabel={t("bestsellerCta")}
            ctaHref="/brennholz"
            products={bestseller(categories, 8)}
          />
        </div>

        <HolzartenVergleich />
        <LieferungAblauf />
        <HolzFaq />
      </main>
      <Footer />

      {/* Identité du marchand, lue par Google pour rattacher le site à la boutique */}
      <OrganizationJsonLd />
    </>
  );
}
