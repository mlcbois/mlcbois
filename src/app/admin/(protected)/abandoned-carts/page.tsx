import Link from "next/link";
import { requireAdminSession } from "@/lib/dal";
import { listAbandonedCartsForAdmin, MAX_REMINDERS } from "@/server/abandonedCarts";
import { formatPrice } from "@/server/pricingUtils";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ADMIN_PAGE_SIZE, paginate, parsePageParam } from "@/lib/pagination";

const inputClass =
  "rounded-sm border border-border px-3 py-1.5 text-sm outline-none focus:border-primary";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  recovered: { label: "Récupéré", className: "bg-[#16a34a] text-white" },
  pending: { label: "En attente", className: "bg-primary/15 text-primary" },
  exhausted: { label: "Sans réponse", className: "bg-muted text-muted-foreground" },
};

/**
 * Historique des relances de panier abandonné.
 *
 * Lecture seule, comme /admin/customers : la séquence d'envoi (25 minutes,
 * puis deux fois 9 heures) tourne d'elle-même via /api/cron/abandoned-carts,
 * rien ici ne déclenche ni n'annule un envoi.
 */
export default async function AdminAbandonedCartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const query = (params.q ?? "").trim();

  const carts = await listAbandonedCartsForAdmin(query || undefined);
  const page = paginate(carts, parsePageParam(params.page), ADMIN_PAGE_SIZE);

  const recoveredCount = carts.filter((cart) => cart.status === "recovered").length;
  const pendingCount = carts.filter((cart) => cart.status === "pending").length;
  const recoveryRate = carts.length > 0 ? Math.round((recoveredCount / carts.length) * 100) : 0;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-black text-foreground">Paniers abandonnés</h1>
      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Suivi à partir de la saisie de l&apos;e-mail à l&apos;étape « contact » du tunnel de
        commande. Jusqu&apos;à {MAX_REMINDERS} relances par panier (25 minutes, puis deux fois
        9 heures après la dernière activité), envoyées automatiquement par la tâche planifiée.
        Lecture seule : rien ici ne déclenche ni n&apos;annule un envoi.
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Paniers suivis" value={carts.length} />
        <StatCard label="Récupérés" value={recoveredCount} suffix={`${recoveryRate} %`} />
        <StatCard label="Relance en cours" value={pendingCount} />
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-foreground">Recherche</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="E-mail ou prénom"
            className={`${inputClass} w-64`}
          />
        </label>
        <button
          type="submit"
          className="rounded-sm bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground hover:brightness-125"
        >
          Appliquer
        </button>
        {query && (
          <Link
            href="/admin/abandoned-carts"
            className="py-2 text-sm font-semibold text-primary hover:underline"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      <p className="mb-3 text-sm text-muted-foreground">
        {page.totalItems === 1 ? "1 panier" : `${page.totalItems} paniers`}
        {query && ` pour « ${query} »`}
      </p>

      <div className="overflow-x-auto rounded-sm border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs font-bold tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Panier</th>
              <th className="px-4 py-3">Relances</th>
              <th className="px-4 py-3">Dernier envoi</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {page.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun panier abandonné trouvé.
                </td>
              </tr>
            )}
            {page.items.map((cart) => {
              const status = STATUS_LABELS[cart.status];
              return (
                <tr key={cart.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{cart.firstName || "—"}</p>
                    <p className="text-muted-foreground">{cart.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""}
                    <br />
                    <span className="font-semibold text-foreground">
                      {formatPrice(cart.totalCents)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cart.remindersSent} / {MAX_REMINDERS}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {cart.lastReminderAt ? dateTimeFormatter.format(cart.lastReminderAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 text-xs font-bold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {cart.status === "recovered" && cart.recoveredOrderId && (
                      <Link
                        href={`/admin/orders/${cart.recoveredOrderId}`}
                        className="mt-1 block text-xs font-semibold text-primary hover:underline"
                      >
                        Voir la commande
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {dateTimeFormatter.format(cart.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminPagination
        {...page}
        basePath="/admin/abandoned-carts"
        params={params}
        label="paniers"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-sm border border-border bg-white px-4 py-3">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-2xl font-black text-foreground">
        {value}
        {suffix && <span className="ml-1.5 text-sm font-semibold text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  );
}
