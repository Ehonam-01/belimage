"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Layers,
  Loader2,
  CheckCircle2,
  ImageIcon,
  Type,
  List,
  FileJson,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { CreativeBlueprint } from "@/types/blueprint";

export default function BlueprintPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [generating, setGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState<CreativeBlueprint | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setBlueprint(data.blueprint);
      toast.success("Blueprint généré !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la génération du blueprint");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au projet
        </Link>

        <div>
          <h1 className="text-3xl font-display font-bold">
            Blueprint créatif
          </h1>
          <p className="text-muted-foreground mt-1">
            Fusion du design et du contenu en instructions de génération
          </p>
        </div>

        {!blueprint && !generating && (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-muted-foreground/25">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Prêt pour le blueprint
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              DeepSeek va fusionner l&apos;analyse du design avec votre contenu
              pour créer un plan de génération complet.
            </p>
            <Button onClick={handleGenerate} size="lg" className="gap-2">
              <Layers className="w-4 h-4" />
              Générer le blueprint
            </Button>
          </div>
        )}

        {generating && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Génération du blueprint...
            </h3>
            <p className="text-sm text-muted-foreground">
              DeepSeek fusionne le design et le contenu
            </p>
          </div>
        )}

        {blueprint && !generating && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Blueprint généré</span>
            </div>

            {/* Structure préservée */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <List className="w-4 h-4" />
                Structure préservée
              </h3>
              <div className="flex flex-wrap gap-2">
                {blueprint.preservedStructure.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Éléments visuels à générer */}
            {blueprint.visualElementsToGenerate.length > 0 && (
              <div className="p-5 rounded-xl border bg-card">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Éléments visuels à générer
                </h3>
                <div className="space-y-2">
                  {blueprint.visualElementsToGenerate.map((el, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted/50 text-sm"
                    >
                      <p className="font-medium">{el.id}</p>
                      <p className="text-muted-foreground">{el.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Textes à composer */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Textes à composer ({blueprint.textElementsToCompose.length})
              </h3>
              <div className="space-y-2">
                {blueprint.textElementsToCompose.map((text, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{text.id}</p>
                      <p className="text-sm text-muted-foreground">
                        &ldquo;{text.content}&rdquo;
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <p>{text.style.fontSize}px</p>
                      <p>{text.style.fontWeight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt image */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Prompt de génération d&apos;image
              </h3>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">
                  {blueprint.imageGenerationPrompt}
                </p>
              </div>
              {blueprint.negativePrompt && (
                <>
                  <h4 className="text-sm font-medium mt-3 mb-1">
                    Negative prompt
                  </h4>
                  <div className="p-3 rounded-lg bg-red-50/50 text-sm text-red-700">
                    {blueprint.negativePrompt}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleGenerate} disabled={generating}>
                Régénérer
              </Button>
              <Button onClick={() => router.push(`/projects/${projectId}`)}>
                Retour au projet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
