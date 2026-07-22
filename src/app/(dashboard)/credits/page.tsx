import { createServerSideClient } from "@/lib/database/server";
import { redirect } from "next/navigation";
import { Coins, ArrowDown, ArrowUp, CreditCard } from "lucide-react";

export default async function CreditsPage() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, transactionsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single(),
    supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const credits =
    (profileResult.data as unknown as { credits: number } | null)?.credits ?? 0;
  const transactions = (transactionsResult.data ?? []) as unknown as {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    balance_after: number;
    created_at: string;
  }[];

  const totalPurchased = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalConsumed = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Crédits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos crédits de génération
          </p>
        </div>

        {/* Balance Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3 mb-6">
            <Coins className="w-6 h-6" />
            <span className="font-display font-semibold text-lg">
              Solde actuel
            </span>
          </div>
          <p className="text-5xl font-display font-bold mb-2">{credits}</p>
          <p className="text-primary-foreground/80 text-sm">
            1 crédit = 1 génération standard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-medium">Achetés</span>
            </div>
            <p className="text-2xl font-display font-bold">{totalPurchased}</p>
          </div>
          <div className="p-5 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">Consommés</span>
            </div>
            <p className="text-2xl font-display font-bold">{totalConsumed}</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="p-6 rounded-xl border bg-muted/30 text-center">
          <CreditCard className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display font-semibold mb-1">
            Achat de crédits bientôt disponible
          </h3>
          <p className="text-sm text-muted-foreground">
            La boutique de crédits sera disponible avec l&apos;intégration
            Stripe.
          </p>
        </div>

        {/* Transactions History */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">
            Historique des transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 rounded-xl border bg-muted/30">
              <p className="text-muted-foreground">
                Aucune transaction pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.amount > 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {tx.type === "purchase"
                          ? "Achat"
                          : tx.type === "generation"
                          ? "Génération"
                          : tx.type === "bonus"
                          ? "Bonus"
                          : tx.type === "refund"
                          ? "Remboursement"
                          : tx.type ?? "Transaction"}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground">
                          {tx.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-display font-bold ${
                        tx.amount > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solde : {tx.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
