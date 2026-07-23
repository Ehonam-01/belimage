import { createServerSideClient } from "@/lib/database/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const supabase = await createServerSideClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, credits, role, created_at")
    .order("created_at", { ascending: false });

  const userList = (users ?? []) as unknown as {
    id: string; email: string; full_name: string | null;
    credits: number; role: string; created_at: string;
  }[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">{userList.length} inscrits</p>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Nom</th>
              <th className="text-center p-3 font-medium">Crédits</th>
              <th className="text-center p-3 font-medium">Rôle</th>
              <th className="text-right p-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((u) => (
              <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u.full_name ?? "—"}</td>
                <td className="p-3 text-center font-medium">{u.credits}</td>
                <td className="p-3 text-center">
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="p-3 text-right text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {userList.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
