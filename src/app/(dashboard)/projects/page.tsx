import { createServerSideClient } from "@/lib/database/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FolderKanban, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProjectsPage() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, poster_type, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const projectList = (projects ?? []) as unknown as {
    id: string;
    title: string;
    status: string;
    poster_type: string | null;
    created_at: string;
    updated_at: string;
  }[];

  const total = projectList.length;
  const completed = projectList.filter((p) => p.status === "completed").length;
  const draft = projectList.filter((p) => p.status === "draft").length;
  const inProgress = projectList.filter(
    (p) => !["completed", "draft", "failed"].includes(p.status)
  ).length;

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }> = {
    draft: { label: "Brouillon", variant: "secondary" },
    analyzing: { label: "Analyse...", variant: "warning" },
    content: { label: "Contenu", variant: "warning" },
    generating: { label: "Génération...", variant: "warning" },
    composing: { label: "Composition...", variant: "warning" },
    completed: { label: "Terminé", variant: "success" },
    failed: { label: "Échec", variant: "destructive" },
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Mes projets</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos projets d&apos;affiches
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-primary mb-1">
              <FolderKanban className="w-4 h-4" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-display font-bold">{total}</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Terminés</span>
            </div>
            <p className="text-2xl font-display font-bold">{completed}</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">En cours</span>
            </div>
            <p className="text-2xl font-display font-bold">{inProgress}</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Brouillons</span>
            </div>
            <p className="text-2xl font-display font-bold">{draft}</p>
          </div>
        </div>

        {/* Projects list */}
        {projectList.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-display font-semibold mb-2">
              Aucun projet pour le moment
            </h3>
            <p className="text-muted-foreground mb-6">
              Créez votre premier projet d&apos;affiche
            </p>
            <Link href="/projects/new">
              <Button size="lg">Créer un projet</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projectList.map((project) => {
              const statusInfo = statusLabels[project.status] ?? {
                label: project.status,
                variant: "outline" as const,
              };
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.status === "completed"
                          ? "bg-emerald-500"
                          : project.status === "failed"
                          ? "bg-red-500"
                          : project.status === "draft"
                          ? "bg-gray-300"
                          : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <h3 className="font-display font-semibold">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.poster_type ?? "Type non défini"} • Créé le{" "}
                        {new Date(project.created_at).toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
