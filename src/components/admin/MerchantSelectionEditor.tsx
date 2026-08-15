"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import type { MerchantSelectionProductOption } from "@/server/merchant";
import type { MerchantSelection } from "@/lib/merchantSelection";

const CARD = "rounded-sm border border-border bg-white p-5";

interface MerchantSelectionEditorProps {
  products: MerchantSelectionProductOption[];
  initialSelection: MerchantSelection;
}

interface CategoryGroup {
  key: string;
  label: string;
  products: MerchantSelectionProductOption[];
}

/**
 * Écran de sélection du flux Google Merchant.
 *
 * Modèle : `restricted` + un ensemble d'identifiants cochés. Tant que
 * `restricted` est faux, toutes les cases s'affichent cochées (tout part dans
 * le flux) — toucher une seule case bascule alors en mode restreint, en
 * partant de « tout coché » pour que décocher un produit se comporte comme
 * attendu : tout, sauf celui-là.
 */
export function MerchantSelectionEditor({
  products,
  initialSelection,
}: MerchantSelectionEditorProps) {
  const [restricted, setRestricted] = useState(initialSelection.restricted);
  const [includedIds, setIncludedIds] = useState<Set<string>>(
    () => new Set(initialSelection.includedProductIds),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  const groups = useMemo<CategoryGroup[]>(() => {
    const byKey = new Map<string, CategoryGroup>();
    for (const product of products) {
      const key = `${product.groupLabel} › ${product.categoryLabel}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.products.push(product);
      } else {
        byKey.set(key, { key, label: key, products: [product] });
      }
    }
    return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [products]);

  const isChecked = (productId: string) => (restricted ? includedIds.has(productId) : true);

  const checkedCount = restricted
    ? activeProducts.filter((product) => includedIds.has(product.id)).length
    : activeProducts.length;

  function markDirty() {
    setNotice(null);
    setError(null);
  }

  /** Bascule en mode restreint en partant de « tout coché », si ce n'est pas déjà le cas. */
  function ensureRestrictedFromAll(): Set<string> {
    if (restricted) return includedIds;
    const all = new Set(products.map((product) => product.id));
    setRestricted(true);
    return all;
  }

  function toggleProduct(productId: string) {
    markDirty();
    const base = ensureRestrictedFromAll();
    const next = new Set(base);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    setIncludedIds(next);
  }

  function setCategory(group: CategoryGroup, checked: boolean) {
    markDirty();
    const base = ensureRestrictedFromAll();
    const next = new Set(base);
    for (const product of group.products) {
      if (!product.active) continue;
      if (checked) next.add(product.id);
      else next.delete(product.id);
    }
    setIncludedIds(next);
  }

  function selectWholeCatalog() {
    markDirty();
    setRestricted(false);
    setIncludedIds(new Set());
  }

  function selectNone() {
    markDirty();
    setRestricted(true);
    setIncludedIds(new Set());
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setNotice(null);

    const response = await fetch("/api/admin/merchant-selection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restricted, includedProductIds: [...includedIds] }),
    });
    const data = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      setError(data?.error ?? "Impossible d'enregistrer la sélection.");
      return;
    }

    // Resynchronise avec ce que le serveur a réellement retenu (des
    // identifiants périmés ont pu être écartés silencieusement).
    setRestricted(data.restricted);
    setIncludedIds(new Set<string>(data.includedProductIds ?? []));
    setNotice(
      data.restricted
        ? `Sélection enregistrée : ${data.includedCount} produit${data.includedCount > 1 ? "s" : ""} dans le flux.`
        : "Sélection enregistrée : tout le catalogue actif part dans le flux.",
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <p className="text-sm font-black text-foreground">
            {checkedCount} sur {activeProducts.length} actifs
          </p>
          <p className="text-xs text-muted-foreground">
            {restricted
              ? "Flux restreint : seuls les produits cochés partent chez Google."
              : "Flux non restreint : tout le catalogue actif part chez Google."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectWholeCatalog}
            className={`rounded-sm border px-3 py-1.5 text-xs font-bold transition-colors ${
              !restricted
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            Tout le catalogue
          </button>
          <button
            type="button"
            onClick={selectNone}
            className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40"
          >
            Ne rien cocher
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-sm bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-sm border border-destructive bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-sm border border-[#16a34a] bg-[#16a34a]/5 px-4 py-3 text-sm font-semibold text-[#16a34a]"
        >
          {notice}
        </p>
      )}

      {groups.map((group) => {
        const activeInGroup = group.products.filter((product) => product.active);
        const checkedInGroup = activeInGroup.filter((product) => isChecked(product.id)).length;

        return (
          <section key={group.key} className={CARD}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-foreground">{group.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {checkedInGroup} sur {activeInGroup.length} actifs
                </p>
              </div>
              <div className="flex gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCategory(group, true)}
                  className="rounded-sm border border-border bg-white px-2.5 py-1 text-foreground hover:border-primary/40"
                >
                  Tout
                </button>
                <button
                  type="button"
                  onClick={() => setCategory(group, false)}
                  className="rounded-sm border border-border bg-white px-2.5 py-1 text-foreground hover:border-primary/40"
                >
                  Aucun
                </button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {group.products.map((product) => {
                const checked = isChecked(product.id);
                return (
                  <li key={product.id}>
                    <label
                      className={`flex items-center gap-2.5 rounded-sm border p-2.5 text-sm transition-colors ${
                        !product.active
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                          : checked
                            ? "cursor-pointer border-primary bg-primary/5"
                            : "cursor-pointer border-border bg-white hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={product.active && checked}
                        disabled={!product.active}
                        onChange={() => toggleProduct(product.id)}
                        className="h-4 w-4 shrink-0 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          {product.brand} {product.name}
                        </span>
                        {!product.active && (
                          <span className="block text-[11px]">
                            Désactivé — ne part jamais dans le flux.
                          </span>
                        )}
                      </span>
                      {product.active && checked && (
                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
