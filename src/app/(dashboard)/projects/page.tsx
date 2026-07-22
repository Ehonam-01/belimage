import { createServerSideClient } from "@/lib/database/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
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

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" }> = {
    draft: { label: "Brouillon", variant: "secondary" },
    analyzing: { label: "Analyse...", variant: "warning" },
    content: { label: "Contenu", variant: "warning" },
    generating: { label: "Génération...", variant: "warning" },
    composing: { label: "Composition...", variant: "warning" },
    completed: { label: "Terminé", variant: "success" },
    failed: { label: "Échec", variant: "outline" },
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
          <div className="grid gap-4">
            {projectList.map((project) => {
              const statusInfo = statusLabels[project.status] ?? {
                label: project.status,
                variant: "outline" as const,
              };
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-display font-semibold text-lg">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.poster_type ?? "Type non défini"} • Créé le{" "}
                      {new Date(project.created_at).toLocaleDateString("fr-FR")}
                    </p>
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
