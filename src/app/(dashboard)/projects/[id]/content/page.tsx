"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Zap,
  ListChecks,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type PosterType = "formation" | "event" | "product" | "birthday" | "custom";

const posterTypeLabels: Record<PosterType, string> = {
  formation: "Formation",
  event: "Événement",
  product: "Produit",
  birthday: "Anniversaire",
  custom: "Personnalisé",
};

export default function ContentPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [mode, setMode] = useState<"quick" | "advanced">("quick");
  const [quickText, setQuickText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [posterType, setPosterType] = useState<PosterType>("formation");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [extractedType, setExtractedType] = useState<string | null>(null);

  const handleQuickMode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          mode: "quick",
          text: quickText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setExtractedType(data.content.type);
      setFields(data.content.fields ?? {});
      setSaved(true);
      toast.success("Contenu extrait avec succès !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'extraction");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedMode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          mode: "advanced",
          fields: { ...fields, title: fields.title ?? posterTypeLabels[posterType] },
          posterType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setSaved(true);
      toast.success("Contenu enregistré !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const getFieldConfig = () => {
    const configs: Record<PosterType, { label: string; placeholder: string; required?: boolean }[]> = {
      formation: [
        { label: "Titre", placeholder: "Formation Vibe Coding", required: true },
        { label: "Sous-titre", placeholder: "Apprenez à coder avec l'IA" },
        { label: "Formateur", placeholder: "Jean Dupont", required: true },
        { label: "Date", placeholder: "25 août 2026", required: true },
        { label: "Heure", placeholder: "19h00" },
        { label: "Lieu", placeholder: "Salle 3, Dakar" },
        { label: "Prix", placeholder: "15 000 FCFA" },
        { label: "Programme", placeholder: "Introduction, pratique, Q&A" },
        { label: "Contact", placeholder: "+221 77 123 45 67" },
        { label: "CTA", placeholder: "Inscrivez-vous maintenant" },
      ],
      event: [
        { label: "Nom", placeholder: "Concert de jazz", required: true },
        { label: "Date", placeholder: "15 septembre 2026", required: true },
        { label: "Heure", placeholder: "20h00" },
        { label: "Lieu", placeholder: "Théâtre national" },
        { label: "Invités", placeholder: "Artiste invité" },
        { label: "Prix", placeholder: "5 000 FCFA" },
        { label: "Contact", placeholder: "+221 77 123 45 67" },
      ],
      product: [
        { label: "Nom", placeholder: "Smartphone X Pro", required: true },
        { label: "Prix", placeholder: "250 000 FCFA", required: true },
        { label: "Réduction", placeholder: "-20%" },
        { label: "Caractéristiques", placeholder: "4K, 128GB, 5G" },
        { label: "CTA", placeholder: "Acheter maintenant" },
        { label: "Contact", placeholder: "+221 77 123 45 67" },
      ],
      birthday: [
        { label: "Nom", placeholder: "Joyeux anniversaire Marie !", required: true },
        { label: "Âge", placeholder: "30 ans" },
        { label: "Date", placeholder: "10 août 2026", required: true },
        { label: "Lieu", placeholder: "Restaurant Le Dakar" },
        { label: "Message", placeholder: "Que cette journée soit spéciale" },
      ],
      custom: [
        { label: "Titre", placeholder: "Titre de votre affiche", required: true },
        { label: "Sous-titre", placeholder: "Sous-titre optionnel" },
        { label: "Description", placeholder: "Description de votre affiche" },
        { label: "CTA", placeholder: "Appel à l'action" },
        { label: "Contact", placeholder: "Votre contact" },
      ],
    };
    return configs[posterType] ?? configs.custom;
  };

  const handleFieldChange = (label: string, value: string) => {
    setFields((prev) => ({ ...prev, [label.toLowerCase()]: value }));
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au projet
        </Link>

        <div>
          <h1 className="text-3xl font-display font-bold">
            Contenu de l&apos;affiche
          </h1>
          <p className="text-muted-foreground mt-1">
            Fournissez les informations de votre affiche
          </p>
        </div>

        {saved ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-display font-bold">
              Contenu enregistré !
            </h2>
            <p className="text-muted-foreground">
              Les informations de votre affiche ont été sauvegardées.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSaved(false);
                  setMode("advanced");
                }}
              >
                Modifier
              </Button>
              <Button onClick={() => router.push(`/projects/${projectId}`)}>
                Retour au projet
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode selector */}
            <div className="flex gap-3 p-1 rounded-xl bg-muted w-fit">
              <button
                onClick={() => setMode("quick")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "quick"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="w-4 h-4" />
                Mode rapide
              </button>
              <button
                onClick={() => setMode("advanced")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "advanced"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                Mode avancé
              </button>
            </div>

            {/* Quick Mode */}
            {mode === "quick" && (
              <form onSubmit={handleQuickMode} className="space-y-4">
                <div className="p-6 rounded-xl border bg-card space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-display font-semibold">
                        Mode rapide
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Décrivez votre affiche en langage naturel. L&apos;IA
                        extrait automatiquement les informations.
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                    placeholder='Ex: "Je veux créer une affiche pour une formation en Vibe Coding qui aura lieu le 25 août à 19h. Le prix est de 15 000 FCFA."'
                    className="w-full min-h-[120px] p-4 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                  />

                  {extractedType && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Type détecté :</span>
                      <Badge variant="secondary">
                        {posterTypeLabels[extractedType as PosterType] ?? extractedType}
                      </Badge>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !quickText.trim()}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extraction...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extraire avec l&apos;IA
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Advanced Mode */}
            {mode === "advanced" && (
              <form onSubmit={handleAdvancedMode} className="space-y-4">
                {/* Poster type selector */}
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(posterTypeLabels) as [PosterType, string][]).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPosterType(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          posterType === key
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>

                {/* Dynamic fields */}
                <div className="p-6 rounded-xl border bg-card space-y-4">
                  <h3 className="font-display font-semibold">
                    Informations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFieldConfig().map((field) => (
                      <div key={field.label} className="space-y-2">
                        <Label>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          placeholder={field.placeholder}
                          value={
                            fields[field.label.toLowerCase()] ?? ""
                          }
                          onChange={(e) =>
                            handleFieldChange(field.label, e.target.value)
                          }
                          required={field.required}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2 w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer le contenu"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
