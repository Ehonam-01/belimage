import { createServerSideClient } from "@/lib/database/server";
import { Users, FolderKanban, Coins, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createServerSideClient();

  const [usersRes, projectsRes, gensRes, errorsRes] = await Promise.all([
    supabase.from("profiles").select("id, credits, role"),
    supabase.from("projects").select("id, status"),
    supabase.from("generations").select("id, status, credits_cost"),
    supabase.from("error_logs").select("id"),
  ]);

  const users = (usersRes.data ?? []) as unknown as { id: string; credits: number; role: string }[];
  const projects = (projectsRes.data ?? []) as unknown as { id: string; status: string }[];
  const gens = (gensRes.data ?? []) as unknown as { id: string; status: string; credits_cost: number }[];
  const errors = (errorsRes.data ?? []) as unknown as { id: string }[];

  const totalCredits = users.reduce((s, u) => s + u.credits, 0);
  const totalGenCost = gens.reduce((s, g) => s + g.credits_cost, 0);
  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Administration</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardStat icon={Users} label="Utilisateurs" value={users.length} sub={`${admins} admin`} color="blue" />
        <CardStat icon={FolderKanban} label="Projets" value={projects.length} sub={`${projects.filter(p => p.status === "completed").length} terminés`} color="green" />
        <CardStat icon={TrendingUp} label="Générations" value={gens.length} sub={`${gens.filter(g => g.status === "completed").length} réussies`} color="purple" />
        <CardStat icon={Coins} label="Crédits" value={totalCredits} sub={`${totalGenCost} consommés`} color="amber" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border bg-card">
          <h3 className="font-display font-semibold mb-4">Projets par statut</h3>
          {["draft", "analyzing", "generating", "composing", "completed", "failed"].map((s) => {
            const count = projects.filter((p) => p.status === s).length;
            if (count === 0) return null;
            return (
              <div key={s} className="flex items-center justify-between py-1.5 text-sm">
                <span className="capitalize text-muted-foreground">{s}</span>
                <span className="font-medium">{count}</span>
              </div>
            );
          })}
          {projects.length === 0 && <p className="text-sm text-muted-foreground">Aucun projet</p>}
        </div>

        <div className="p-5 rounded-xl border bg-card">
          <h3 className="font-display font-semibold mb-4">Système</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Erreurs enregistrées</span>
              <span className="font-medium">{errors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moyenne crédits/projet</span>
              <span className="font-medium">
                {projects.length > 0 ? (totalGenCost / projects.length).toFixed(1) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Générations échouées</span>
              <span className="font-medium text-red-500">
                {gens.filter((g) => g.status === "failed").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardStat({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; sub: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", purple: "bg-purple-50 text-purple-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <div className="p-5 rounded-xl border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold mt-0.5">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      </div>
    </div>
  );
}
