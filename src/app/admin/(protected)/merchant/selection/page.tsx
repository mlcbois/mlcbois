import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/dal";
import { listMerchantSelectionOptions } from "@/server/merchant";
import { getMerchantSelection } from "@/server/merchantSelection";
import { MerchantSelectionEditor } from "@/components/admin/MerchantSelectionEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sélection du flux Google Merchant | Administration",
};

export default async function MerchantSelectionPage() {
  await requireAdminSession();

  const [products, selection] = await Promise.all([
    listMerchantSelectionOptions(),
    getMerchantSelection(),
  ]);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/merchant"
          className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Google Merchant Center
        </Link>
        <h1 className="text-2xl font-black text-foreground">Sélection du flux</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Par défaut, tout le catalogue actif part dans le flux envoyé à Google Shopping.
          Restreignez la diffusion en décochant des produits ci-dessous — une restriction ne peut
          jamais être enregistrée vide, pour ne pas retirer la boutique entière de Google par
          erreur.
        </p>
      </div>

      <MerchantSelectionEditor products={products} initialSelection={selection} />
    </>
  );
}
