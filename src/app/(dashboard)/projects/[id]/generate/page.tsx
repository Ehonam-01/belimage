"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

interface GenerationResult {
  url: string;
  provider: string;
  width: number;
  height: number;
  seed?: number;
}

export default function GeneratePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [generating, setGenerating] = useState(false);
  const [variantCount, setVariantCount] = useState(1);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, variants: variantCount }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setResults(data.results);
      toast.success("Génération terminée !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la génération");
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
            Générer l&apos;affiche
          </h1>
          <p className="text-muted-foreground mt-1">
            Lancez la génération de votre affiche personnalisée
          </p>
        </div>

        {/* Before generation */}
        {results.length === 0 && !generating && (
          <div className="space-y-6">
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-muted-foreground/25">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Prêt pour la génération
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                L&apos;IA va générer l&apos;arrière-plan et les éléments
                visuels de votre affiche selon le blueprint.
              </p>
            </div>

            {/* Variant selector */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-display font-semibold mb-4">
                Nombre de variantes
              </h3>
              <div className="flex gap-3">
                {[1, 2, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setVariantCount(n)}
                    className={`flex-1 p-4 rounded-xl text-center font-display font-semibold transition-all ${
                      variantCount === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span className="text-2xl">{n}</span>
                    <p className="text-sm font-normal mt-1">
                      {n === 1 ? "variante" : "variantes"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              size="lg"
              className="w-full gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Lancer la génération
            </Button>
          </div>
        )}

        {/* Generating */}
        {generating && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              Génération en cours...
            </h3>
            <p className="text-sm text-muted-foreground">
              Création de {variantCount} variante{variantCount > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !generating && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">
                {results.length} variante{results.length > 1 ? "s" : ""} générée
                {results.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Main preview */}
            <div className="rounded-2xl overflow-hidden border bg-muted/30">
              {results[selectedIndex]?.url ? (
                <div className="relative flex items-center justify-center p-4">
                  <Image
                    src={results[selectedIndex].url}
                    alt="Affiche générée"
                    width={500}
                    height={625}
                    className="rounded-lg shadow-lg object-contain max-h-[600px]"
                  />
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Variants */}
            {results.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {results.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedIndex
                        ? "border-primary shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {result.url && (
                      <Image
                        src={result.url}
                        alt={`Variante ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Régénérer
              </Button>
              <Button
                variant="outline"
                onClick={() => setVariantCount(4)}
                className="gap-2"
              >
                Plus de variantes
              </Button>
              <Button onClick={() => router.push(`/projects/${projectId}`)}>
                Terminer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
