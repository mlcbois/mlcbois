import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchaseBox } from "@/components/ProductPurchaseBox";
import { ProductReviewSection } from "@/components/ProductReviewSection";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { PaymentMethodsBar } from "@/components/PaymentMethodsBar";
import { ProductGrid } from "@/components/ProductGrid";
import { RecordProductView } from "@/components/product/RecordProductView";
import { getCategoryPages, getProductBySlug, getRelatedProducts } from "@/server/store";
import { loadCatalogTranslations, localizeCategoryPage } from "@/server/localizedContent";
import { productLongText, productShortText } from "@/lib/productText";
import { formatRating } from "@/lib/formatRating";
import { alternatesFor, openGraphFor } from "@/lib/hreflang";
import type { Locale } from "@/i18n/routing";

type ProductPageParams = Promise<{
  locale: Locale;
  group: string;
  category: string;
  product: string;
}>;

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategoryPages();
  return categories.flatMap((category) =>
    category.products.map((product) => ({
      group: category.group,
      category: category.slug,
      product: product.slug ?? "",
    })),
  );
}

/** Charge la fiche produit et sa catégorie, traduites dans la langue demandée. */
async function loadLocalizedProduct(
  locale: Locale,
  group: string,
  category: string,
  product: string,
) {
  const [data, translations] = await Promise.all([
    getProductBySlug(group, category, product),
    loadCatalogTranslations(locale),
  ]);
  if (!data) return undefined;

  const localizedCategory = localizeCategoryPage(data.category, translations);
  const localizedProduct = localizedCategory.products.find((item) => item.slug === product);

  return localizedProduct
    ? { category: localizedCategory, product: localizedProduct }
    : undefined;
}

export async function generateMetadata({ params }: { params: ProductPageParams }): Promise<Metadata> {
  const { locale, group, category, product } = await params;
  const data = await loadLocalizedProduct(locale, group, category, product);
  if (!data) return {};

  const t = await getTranslations({ locale, namespace: "product" });
  const title = t("metaTitle", { name: `${data.product.brand} ${data.product.name}` });
  const description = data.product.bullets.join(" · ");
  const href = `/${group}/${category}/${product}`;

  return {
    title,
    description,
    alternates: alternatesFor(href, locale),
    ...openGraphFor({ href, locale, title, description, image: data.product.image }),
  };
}

export default async function ProductPage({ params }: { params: ProductPageParams }) {
  const { locale, group, category, product } = await params;
  setRequestLocale(locale);

  const data = await loadLocalizedProduct(locale, group, category, product);

  if (!data) {
    notFound();
  }

  const t = await getTranslations("product");
  const common = await getTranslations("common");

  const { category: categoryData, product: productData } = data;
  const relatedProducts = getRelatedProducts(categoryData, productData.slug ?? "", 6);

  const shortText = productShortText(productData, categoryData.label, locale);
  const description = productLongText(productData, categoryData.label, locale);

  return (
    <>
      {/* Aucun rendu : note la consultation pour le popup de sortie et la
          page « Consultés récemment ». */}
      {productData.id && (
        <RecordProductView
          productId={productData.id}
          slug={productData.slug ?? ""}
          brand={productData.brand}
          name={productData.name}
          image={productData.image}
          path={productData.href}
          priceCents={productData.priceCents ?? 0}
        />
      )}
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-white">
          <div className="mx-auto max-w-screen-xl px-3 py-3">
            <Breadcrumb
              items={[
                { label: common("home"), href: "/" },
                { label: categoryData.groupLabel, href: `/${categoryData.group}` },
                { label: categoryData.label, href: `/${categoryData.group}/${categoryData.slug}` },
                { label: productData.name },
              ]}
            />
          </div>
        </div>

        <div className="mx-auto max-w-screen-xl px-3 py-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ProductGallery
              image={productData.image}
              images={productData.images}
              alt={productData.alt}
            />

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {productData.brand}
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">{productData.name}</h1>
                {typeof productData.rating === "number" && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    ⭐ {t("ratingOf", { rating: formatRating(productData.rating, locale) })}
                    {productData.reviewCount
                      ? ` · ${t("reviewCount", { count: productData.reviewCount })}`
                      : ""}{" "}
                    · {t("sku")}: {productData.sku}
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">{shortText}</p>
              </div>

              <ProductPurchaseBox product={productData} />
              <PaymentMethodsBar />
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-screen-xl px-3 py-8">
          <h2 className="mb-4 text-xl font-black text-foreground">{t("details")}</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-bold text-foreground">{t("description")}</h3>
              {/* `whitespace-pre-line` : les descriptions sont rédigées en
                  plusieurs paragraphes séparés par une ligne vide. Sans cette
                  classe, le navigateur les réduirait à un seul bloc de texte. */}
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-foreground">{t("features")}</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {productData.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="text-primary">✓</span> {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {productData.id && (
          <div className="border-t border-border">
            <ProductReviewSection productId={productData.id} editorialRating={productData.rating} />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="border-t border-border">
            <ProductGrid
              heading={t("related")}
              ctaLabel={common("showAll")}
              ctaHref={`/${categoryData.group}/${categoryData.slug}`}
              products={relatedProducts}
            />
          </div>
        )}
      </main>
      <Footer />

      {/* Données structurées : cohérentes avec le prix et la disponibilité affichés */}
      <ProductJsonLd product={productData} />
      <BreadcrumbJsonLd
        items={[
          { label: common("home"), href: "/" },
          { label: categoryData.groupLabel, href: `/${categoryData.group}` },
          { label: categoryData.label, href: `/${categoryData.group}/${categoryData.slug}` },
          { label: productData.name },
        ]}
      />
    </>
  );
}
