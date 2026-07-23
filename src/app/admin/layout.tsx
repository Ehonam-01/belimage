import { redirect } from "next/navigation";
import { createServerSideClient } from "@/lib/database/server";
import { BarChart3, Users, FolderKanban, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban },
  { href: "/admin/errors", label: "Erreurs", icon: AlertTriangle },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as unknown as { role: string } | null)?.role;
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-card flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">BelImage Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Retour app
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20">{children}</main>
    </div>
  );
}
