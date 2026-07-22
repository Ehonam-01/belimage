"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Palette,
  Layout,
  ImageIcon,
  List,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DesignAnalysis } from "@/types/design-analysis";

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DesignAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          imageUrl: "Analyse du modèle importé",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        toast.error(data.error);
        return;
      }

      setResult(data.analysis);
      toast.success("Analyse terminée !");
      router.refresh();
    } catch {
      const errMsg = "Erreur lors de l'analyse";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au projet
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">
            Analyse du design
          </h1>
          <p className="text-muted-foreground mt-1">
            L&apos;IA analyse la structure visuelle de votre modèle
          </p>
        </div>

        {/* Analyze button or results */}
        {!result && !analyzing && !error && (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-muted-foreground/25">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Prêt pour l&apos;analyse
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              DeepSeek va analyser votre modèle et extraire sa composition,
              ses couleurs, sa hiérarchie et ses éléments.
            </p>
            <Button onClick={handleAnalyze} size="lg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Lancer l&apos;analyse
            </Button>
          </div>
        )}

        {/* Loading */}
        {analyzing && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Analyse en cours...
            </h3>
            <p className="text-sm text-muted-foreground">
              DeepSeek analyse la structure du design
            </p>
            <div className="mt-6 space-y-2 max-w-xs mx-auto">
              <LoadingStep text="Extraction de la composition" done={false} />
              <LoadingStep text="Identification des couleurs" done={false} />
              <LoadingStep text="Détection des éléments" done={false} />
              <LoadingStep text="Génération des règles" done={false} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !analyzing && (
          <div className="text-center py-12 rounded-2xl border border-red-200 bg-red-50/50">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
            <h3 className="font-display font-semibold text-lg mb-2">
              Analyse échouée
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleAnalyze} variant="outline">
              Réessayer
            </Button>
          </div>
        )}

        {/* Results */}
        {result && !analyzing && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Analyse terminée</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnalysisCard
                icon={Layout}
                title="Canvas"
                items={[
                  { label: "Largeur", value: `${result.canvas.width}px` },
                  { label: "Hauteur", value: `${result.canvas.height}px` },
                  { label: "Ratio", value: result.canvas.aspectRatio },
                ]}
              />
              <AnalysisCard
                icon={Palette}
                title="Style visuel"
                items={[
                  { label: "Catégorie", value: result.visualStyle.category },
                  { label: "Ambiance", value: result.visualStyle.mood },
                  { label: "Énergie", value: result.visualStyle.energy },
                ]}
              />
            </div>

            {/* Colors */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Palette de couleurs
              </h3>
              <div className="flex flex-wrap gap-3">
                {result.colorPalette.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg border shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <p className="text-xs font-mono">{c.color}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elements */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <List className="w-4 h-4" />
                Éléments détectés ({result.elements.length})
              </h3>
              <div className="space-y-2">
                {result.elements.map((el, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{el.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {el.type} • Importance: {el.importance}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {el.replaceable ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Remplaçable
                        </span>
                      ) : null}
                      {el.mustBeComposedPrecisely ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Texte précis
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Rules */}
            <div className="p-5 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-3">
                Règles de design à préserver
              </h3>
              <ul className="space-y-1">
                {result.designRules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                Relancer l&apos;analyse
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

function LoadingStep({ text, done }: { text: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
      )}
      <span className={done ? "text-emerald-600" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}

function AnalysisCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="p-5 rounded-xl border bg-card">
      <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
