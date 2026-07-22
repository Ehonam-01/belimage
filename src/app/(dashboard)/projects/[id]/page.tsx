import { notFound } from "next/navigation";
import { createServerSideClient } from "@/lib/database/server";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProjectActions } from "@/components/projects/project-actions";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerSideClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  const projectData = project as unknown as {
    id: string;
    title: string;
    description: string | null;
    status: string;
    poster_type: string | null;
    reference_model_url: string | null;
    reference_analysis: Record<string, unknown> | null;
    user_content: Record<string, unknown> | null;
    creative_blueprint: Record<string, unknown> | null;
    final_url: string | null;
    created_at: string;
    updated_at: string;
    credits_consumed: number;
  };

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" }> = {
    draft: { label: "Brouillon", variant: "secondary" },
    analyzing: { label: "Analyse...", variant: "warning" },
    content: { label: "Contenu", variant: "warning" },
    generating: { label: "Génération...", variant: "warning" },
    composing: { label: "Composition...", variant: "warning" },
    completed: { label: "Terminé", variant: "success" },
    failed: { label: "Échec", variant: "outline" },
  };

  const statusInfo = statusLabels[projectData.status] ?? {
    label: projectData.status,
    variant: "outline" as const,
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">
              {projectData.title}
            </h1>
            {projectData.description && (
              <p className="text-muted-foreground mt-2">
                {projectData.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <span>
                Créé le{" "}
                {new Date(projectData.created_at).toLocaleDateString("fr-FR")}
              </span>
              <span>Crédits : {projectData.credits_consumed}</span>
            </div>
          </div>

          <ProjectActions
            projectId={projectData.id}
            projectTitle={projectData.title}
            projectDescription={projectData.description}
          />
        </div>

        {/* Pipeline steps */}
        <div className="grid gap-4">
          <StepCard
            number={1}
            title="Importer un modèle"
            description="Téléchargez l'affiche modèle à utiliser comme référence"
            href={`/projects/${id}/model`}
            status={projectData.reference_model_url ? "completed" : "pending"}
          />
          <StepCard
            number={2}
            title="Analyser le design"
            description="L'IA analyse la composition et le style du modèle"
            href={`/projects/${id}/analysis`}
            status={projectData.status === "analyzing" || projectData.reference_analysis ? "completed" : "pending"}
          />
          <StepCard
            number={3}
            title="Remplir le contenu"
            description="Fournissez les informations de votre affiche"
            href={`/projects/${id}/content`}
            status={projectData.user_content ? "completed" : "pending"}
          />
          <StepCard
            number={4}
            title="Générer le blueprint"
            description="Fusion design + contenu en plan de création"
            href={`/projects/${id}/blueprint`}
            status={projectData.creative_blueprint ? "completed" : "pending"}
          />
          <StepCard
            number={5}
            title="Générer l'affiche"
            description="Lancez la génération de votre affiche personnalisée"
            href={`/projects/${id}/generate`}
            status={projectData.final_url ? "completed" : projectData.status === "generating" || projectData.status === "composing" ? "in-progress" : "pending"}
          />
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  status,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
  status: "completed" | "in-progress" | "pending";
}) {
  const statusIcon = {
    completed: "✅",
    "in-progress": "🔄",
    pending: "⏳",
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-secondary-foreground">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-display font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-lg">{statusIcon[status]}</span>
    </div>
  );
}
