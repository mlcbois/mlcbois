import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminApi";
import { saveMerchantSelection } from "@/server/merchantSelection";

/**
 * Enregistre la liste blanche de produits diffusés dans le flux Google
 * Merchant Center. Voir `saveMerchantSelection` pour les garde-fous
 * (identifiants périmés écartés silencieusement, restriction vide refusée).
 */
export async function PUT(request: Request) {
  const { session, unauthorized } = await requireAdminApi();
  if (unauthorized || !session) {
    return unauthorized ?? NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    restricted?: unknown;
    includedProductIds?: unknown;
  } | null;

  if (!body || typeof body.restricted !== "boolean") {
    return NextResponse.json({ error: "Requête illisible." }, { status: 400 });
  }

  const includedProductIds = Array.isArray(body.includedProductIds)
    ? body.includedProductIds.filter((entry): entry is string => typeof entry === "string")
    : [];

  const result = await saveMerchantSelection({ restricted: body.restricted, includedProductIds });

  if (result.status === "rejected-empty") {
    return NextResponse.json(
      {
        error:
          "Impossible d'enregistrer une sélection restreinte sans aucun produit coché — cela viderait entièrement le flux Google Merchant. Cochez au moins un produit, ou choisissez « Tout le catalogue ».",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    restricted: result.selection.restricted,
    includedProductIds: result.selection.includedProductIds,
    includedCount: result.includedCount,
  });
}
