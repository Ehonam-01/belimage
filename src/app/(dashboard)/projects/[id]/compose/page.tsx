"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Layers,
  Type,
  Move,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
}

export default function ComposePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [background] = useState<string | null>(null);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addText = useCallback(() => {
    const newText: TextElement = {
      id: `text_${Date.now()}`,
      content: "Nouveau texte",
      x: 100,
      y: 100,
      width: 400,
      height: 60,
      fontSize: 32,
      fontWeight: 700,
      color: "#FFFFFF",
      textAlign: "center",
    };
    setTexts((prev) => [...prev, newText]);
    setSelectedId(newText.id);
  }, []);

  const updateText = useCallback(
    (id: string, changes: Partial<TextElement>) => {
      setTexts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
      );
    },
    []
  );

  const removeText = useCallback((id: string) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          layers: texts.map((t) => ({
            id: t.id,
            type: "text",
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            zIndex: 10,
            visible: true,
            locked: false,
            content: t.content,
            fontSize: t.fontSize,
            fontWeight: t.fontWeight,
            color: t.color,
            textAlign: t.textAlign,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setSaved(true);
      toast.success("Composition sauvegardée !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const selected = texts.find((t) => t.id === selectedId);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au projet
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={addText} className="gap-2">
              <Type className="w-4 h-4" />
              Ajouter un texte
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {saved ? "Sauvegardé" : "Sauvegarder"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div
                className="relative mx-auto"
                style={{
                  width: "100%",
                  maxWidth: 500,
                  aspectRatio: "4/5",
                  backgroundColor: background ? "transparent" : "#f0f0f0",
                }}
              >
                {background && (
                  <Image
                    src={background}
                    alt="Background"
                    fill
                    className="object-cover"
                  />
                )}

                {/* Text overlays */}
                {texts.map((text) => (
                  <div
                    key={text.id}
                    onClick={() => setSelectedId(text.id)}
                    className={`absolute cursor-move border-2 transition-colors ${
                      selectedId === text.id
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    style={{
                      left: text.x,
                      top: text.y,
                      width: text.width,
                      height: text.height,
                    }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
                      style={{
                        fontSize: text.fontSize / 3,
                        fontWeight: text.fontWeight,
                        color: text.color,
                        textAlign: text.textAlign,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {text.content}
                    </div>
                  </div>
                ))}

                {!background && texts.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Layers className="w-12 h-12 mx-auto mb-3" />
                      <p>Ajoutez des textes pour composer votre affiche</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Properties panel */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Move className="w-4 h-4" />
                Propriétés
              </h3>

              {selected ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Contenu
                    </label>
                    <Input
                      value={selected.content}
                      onChange={(e) =>
                        updateText(selected.id, { content: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">X</label>
                      <Input
                        type="number"
                        value={selected.x}
                        onChange={(e) =>
                          updateText(selected.id, {
                            x: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Y</label>
                      <Input
                        type="number"
                        value={selected.y}
                        onChange={(e) =>
                          updateText(selected.id, {
                            y: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Taille
                      </label>
                      <Input
                        type="number"
                        value={selected.fontSize}
                        onChange={(e) =>
                          updateText(selected.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Poids
                      </label>
                      <select
                        value={selected.fontWeight}
                        onChange={(e) =>
                          updateText(selected.id, {
                            fontWeight: Number(e.target.value),
                          })
                        }
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value={400}>Normal</option>
                        <option value={600}>Semi-bold</option>
                        <option value={700}>Bold</option>
                        <option value={800}>Extra bold</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Couleur
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selected.color}
                        onChange={(e) =>
                          updateText(selected.id, { color: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={selected.color}
                        onChange={(e) =>
                          updateText(selected.id, { color: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Alignement
                    </label>
                    <div className="flex gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            updateText(selected.id, { textAlign: align })
                          }
                          className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all ${
                            selected.textAlign === align
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {align === "left"
                            ? "◁"
                            : align === "center"
                            ? "⟺"
                            : "▷"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeText(selected.id)}
                    className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Cliquez sur un texte pour le modifier
                </p>
              )}

              {/* Layers list */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Calques</h4>
                <div className="space-y-1">
                  {texts.map((text, i) => (
                    <button
                      key={text.id}
                      onClick={() => setSelectedId(text.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${
                        selectedId === text.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span className="truncate">{text.content}</span>
                      <span className="ml-auto text-xs opacity-50">
                        T{i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
