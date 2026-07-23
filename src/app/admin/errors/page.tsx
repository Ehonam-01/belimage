import { createServerSideClient } from "@/lib/database/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminErrorsPage() {
  const supabase = await createServerSideClient();
  const { data: errors } = await supabase
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const errList = (errors ?? []) as unknown as {
    id: string; service: string; error_type: string;
    error_message: string | null; severity: string;
    created_at: string; user_id: string | null;
  }[];

  const severityColors: Record<string, "default" | "secondary" | "outline" | "destructive" | "warning"> = {
    low: "secondary", medium: "warning", high: "destructive", critical: "destructive",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Erreurs</h1>
        <p className="text-sm text-muted-foreground mt-1">Dernières {errList.length} entrées</p>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Service</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Message</th>
              <th className="text-center p-3 font-medium">Sévérité</th>
              <th className="text-right p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {errList.map((e) => (
              <tr key={e.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{e.service}</td>
                <td className="p-3 text-muted-foreground">{e.error_type}</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{e.error_message ?? "—"}</td>
                <td className="p-3 text-center">
                  <Badge variant={severityColors[e.severity] ?? "outline"}>{e.severity}</Badge>
                </td>
                <td className="p-3 text-right text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
            {errList.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucune erreur</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
