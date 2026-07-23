import { createServerSideClient } from "@/lib/database/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminProjectsPage() {
  const supabase = await createServerSideClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, poster_type, user_id, created_at, credits_consumed")
    .order("created_at", { ascending: false });

  const projList = (projects ?? []) as unknown as {
    id: string; title: string; status: string;
    poster_type: string | null; user_id: string;
    created_at: string; credits_consumed: number;
  }[];

  const badge: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "destructive"> = {
    draft: "secondary", analyzing: "warning", generating: "warning",
    composing: "warning", completed: "success", failed: "destructive",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Projets</h1>
        <p className="text-sm text-muted-foreground mt-1">{projList.length} projets</p>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Titre</th>
              <th className="text-center p-3 font-medium">Statut</th>
              <th className="text-center p-3 font-medium">Type</th>
              <th className="text-center p-3 font-medium">Crédits</th>
              <th className="text-right p-3 font-medium">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {projList.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-center">
                  <Badge variant={badge[p.status] ?? "outline"}>{p.status}</Badge>
                </td>
                <td className="p-3 text-center text-muted-foreground">{p.poster_type ?? "—"}</td>
                <td className="p-3 text-center">{p.credits_consumed}</td>
                <td className="p-3 text-right text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {projList.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun projet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
