import { createServerSideClient } from "@/lib/database/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  Sparkles,
  CheckCircle2,
  Plus,
  Coins,
} from "lucide-react";

async function getDashboardStats(userId: string) {
  const supabase = await createServerSideClient();

  const [profileResult, projectsResult, generationsResult, recentProjects] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, credits, role")
        .eq("id", userId)
        .single(),
      supabase
        .from("projects")
        .select("id, status")
        .eq("user_id", userId),
      supabase
        .from("generations")
        .select("id, status")
        .eq("user_id", userId),
      supabase
        .from("projects")
        .select("id, title, status, poster_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const projects = (projectsResult.data ?? []) as unknown as {
    id: string;
    status: string;
  }[];
  const generations = (generationsResult.data ?? []) as unknown as {
    id: string;
    status: string;
  }[];

  return {
    profile: profileResult.data as unknown as {
      id: string;
      email: string;
      full_name: string | null;
      credits: number;
      role: string;
    } | null,
    totalProjects: projects.length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    totalGenerations: generations.length,
    successfulGenerations: generations.filter((g) => g.status === "completed").length,
    recentProjects: (recentProjects.data ?? []) as unknown as {
      id: string;
      title: string;
      status: string;
      poster_type: string | null;
      created_at: string;
    }[],
  };
}

export default async function DashboardPage() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getDashboardStats(user.id);
  const profileData = stats.profile;
  const credits = profileData?.credits ?? 0;
  const fullName = profileData?.full_name ?? user.email ?? "Créateur";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">
            Bonjour, {fullName.split(" ")[0] ?? "Créateur"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité sur BelImage.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={FolderKanban}
            label="Projets"
            value={stats.totalProjects}
            sub="Total"
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Terminés"
            value={stats.completedProjects}
            sub="Projets"
            color="green"
          />
          <StatCard
            icon={Sparkles}
            label="Générations"
            value={stats.totalGenerations}
            sub="Totales"
            color="purple"
          />
          <StatCard
            icon={Coins}
            label="Crédits"
            value={credits}
            sub="Disponibles"
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-4">
            Actions rapides
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/projects/new"
              className="group p-5 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">
                    Nouveau projet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Créer une nouvelle affiche
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/projects"
              className="group p-5 rounded-xl border hover:border-primary/20 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Mes projets</h3>
                  <p className="text-sm text-muted-foreground">
                    Voir tous mes projets
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/credits"
              className="group p-5 rounded-xl border hover:border-primary/20 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Coins className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Crédits</h3>
                  <p className="text-sm text-muted-foreground">
                    {credits} crédits disponibles
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold">
              Projets récents
            </h2>
            <Link
              href="/projects"
              className="text-sm text-primary hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {stats.recentProjects.length === 0 ? (
            <div className="text-center py-12 rounded-xl border bg-muted/30">
              <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-display font-semibold mb-1">
                Aucun projet pour le moment
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre premier projet d&apos;affiche
              </p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="w-4 h-4" />
                Créer un projet
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.status === "completed"
                          ? "bg-emerald-500"
                          : project.status === "failed"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <span className="font-medium">{project.title}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {project.poster_type ?? "Projet"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {new Date(project.created_at).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "short" }
                      )}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };

  return (
    <div className="p-5 rounded-xl border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    analyzing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    generating: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const labels: Record<string, string> = {
    draft: "Brouillon",
    analyzing: "Analyse",
    generating: "Génération",
    completed: "Terminé",
    failed: "Échec",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
