"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Type,
  ImageIcon,
  Download,
  Save,
  Trash2,
  Layers,
  Eye,
  EyeOff,
  Move,
  Sparkles,
} from "lucide-react";

interface EditorLayer {
  id: string;
  type: "text" | "image";
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  imageUrl?: string;
  opacity?: number;
}

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [background] = useState<string | null>(null);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);

  // Load project data
  useEffect(() => {
    fetch(`/api/projects/${projectId}`).catch(() => {});
  }, [projectId]);

  const selected = layers.find((l) => l.id === selectedId);

  const addText = useCallback(() => {
    const layer: EditorLayer = {
      id: `text_${Date.now()}`,
      type: "text",
      content: "Nouveau texte",
      x: 50,
      y: 50,
      width: 300,
      height: 50,
      zIndex: layers.length + 1,
      visible: true,
      fontSize: 28,
      fontWeight: 700,
      color: "#FFFFFF",
      textAlign: "center",
      fontFamily: "Inter",
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  }, [layers.length]);

  const updateLayer = useCallback(
    (id: string, changes: Partial<EditorLayer>) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...changes } : l))
      );
    },
    []
  );

  const removeLayer = useCallback(
    (id: string) => {
      setLayers((prev) => prev.filter((l) => l.id !== id));
      setSelectedId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const toggleVisibility = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const moveLayerUp = useCallback((id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[idx]!.zIndex;
      next[idx] = { ...next[idx]!, zIndex: next[idx + 1]!.zIndex };
      next[idx + 1] = { ...next[idx + 1]!, zIndex: temp };
      return next;
    });
  }, []);

  const moveLayerDown = useCallback((id: string) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const temp = next[idx]!.zIndex;
      next[idx] = { ...next[idx]!, zIndex: next[idx - 1]!.zIndex };
      next[idx - 1] = { ...next[idx - 1]!, zIndex: temp };
      return next;
    });
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - layer.x,
      y: e.clientY - layer.y,
    });
    setSelectedId(id);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      updateLayer(draggingId, {
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, rect.width - 50)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.y, rect.height - 50)),
      });
    },
    [draggingId, dragOffset, updateLayer]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setResizingId(null);
  }, []);

  useEffect(() => {
    if (draggingId || resizingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingId, resizingId, handleMouseMove, handleMouseUp]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          layers: layers.map((l) => ({
            ...l,
            zIndex: layers.indexOf(l) + 1,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Composition sauvegardée !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          layers: layers.map((l) => ({ ...l, zIndex: layers.indexOf(l) + 1 })),
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // Open export preview in new window
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(data.html);
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
        }, 500);
      }

      toast.success("Export prêt !");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-display font-semibold">Éditeur</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={addText}
            className="gap-1.5"
          >
            <Type className="w-4 h-4" />
            Texte
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving ? "..." : "Sauvegarder"}
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center p-8 overflow-auto">
          <div
            ref={canvasRef}
            className="relative shadow-2xl rounded-lg overflow-hidden"
            style={{
              width: "100%",
              maxWidth: 500,
              aspectRatio: "4/5",
              backgroundColor: background ? "transparent" : "#e5e5e5",
              backgroundImage: background ? `url(${background})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => setSelectedId(null)}
          >
            {sortedLayers
              .filter((l) => l.visible)
              .map((layer) => (
                <div
                  key={layer.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, layer.id);
                  }}
                  className={`absolute group cursor-grab active:cursor-grabbing ${
                    selectedId === layer.id
                      ? "ring-2 ring-primary ring-offset-1"
                      : "hover:ring-1 hover:ring-primary/50 hover:ring-offset-1"
                  }`}
                  style={{
                    left: layer.x,
                    top: layer.y,
                    width: layer.width,
                    height: layer.height,
                    zIndex: layer.zIndex,
                    opacity: layer.opacity ?? 1,
                    cursor: draggingId === layer.id ? "grabbing" : "grab",
                  }}
                >
                  {layer.type === "text" && (
                    <div
                      className="w-full h-full flex items-center justify-center p-2 overflow-hidden select-none"
                      style={{
                        fontSize: layer.fontSize ?? 16,
                        fontWeight: layer.fontWeight ?? 400,
                        color: layer.color ?? "#000",
                        textAlign: layer.textAlign ?? "left",
                        fontFamily: `${layer.fontFamily ?? "Inter"}, sans-serif`,
                      }}
                    >
                      {layer.content}
                    </div>
                  )}
                  {layer.type === "image" && layer.imageUrl && (
                    <div className="w-full h-full">
                      <Image
                        src={layer.imageUrl}
                        alt=""
                        fill
                        className="object-cover pointer-events-none"
                      />
                    </div>
                  )}

                  {/* Resize handle */}
                  {selectedId === layer.id && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-background rounded-sm cursor-nw-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizingId(layer.id);
                      }}
                    />
                  )}
                </div>
              ))}

            {layers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ajoutez des textes</p>
                  <p className="text-xs opacity-60">pour commencer</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 border-l bg-card overflow-y-auto flex-shrink-0">
          {/* Properties */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Move className="w-3.5 h-3.5" />
              Propriétés
            </h3>
            {selected ? (
              <div className="space-y-3">
                {selected.type === "text" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Contenu</label>
                      <textarea
                        value={selected.content ?? ""}
                        onChange={(e) =>
                          updateLayer(selected.id, { content: e.target.value })
                        }
                        className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Taille</label>
                        <Input
                          type="number"
                          value={selected.fontSize ?? 16}
                          onChange={(e) =>
                            updateLayer(selected.id, { fontSize: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Poids</label>
                        <select
                          value={selected.fontWeight ?? 400}
                          onChange={(e) =>
                            updateLayer(selected.id, { fontWeight: Number(e.target.value) })
                          }
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={300}>Light</option>
                          <option value={400}>Regular</option>
                          <option value={500}>Medium</option>
                          <option value={600}>SemiBold</option>
                          <option value={700}>Bold</option>
                          <option value={800}>ExtraBold</option>
                          <option value={900}>Black</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Couleur</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selected.color ?? "#000000"}
                          onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={selected.color ?? "#000000"}
                          onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Alignement</label>
                      <div className="flex gap-1">
                        {(["left", "center", "right"] as const).map((a) => (
                          <button
                            key={a}
                            onClick={() => updateLayer(selected.id, { textAlign: a })}
                            className={`flex-1 p-1.5 rounded text-xs font-medium transition-all ${
                              selected.textAlign === a
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {a === "left" ? "≡" : a === "center" ? "≣" : "≡"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">X</label>
                    <Input
                      type="number"
                      value={Math.round(selected.x)}
                      onChange={(e) => updateLayer(selected.id, { x: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Y</label>
                    <Input
                      type="number"
                      value={Math.round(selected.y)}
                      onChange={(e) => updateLayer(selected.id, { y: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Larg.</label>
                    <Input
                      type="number"
                      value={Math.round(selected.width)}
                      onChange={(e) => updateLayer(selected.id, { width: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Haut.</label>
                    <Input
                      type="number"
                      value={Math.round(selected.height)}
                      onChange={(e) => updateLayer(selected.id, { height: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLayer(selected.id)}
                  className="w-full gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                Cliquez sur un élément du canvas
              </p>
            )}
          </div>

          {/* Layers */}
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Calques ({layers.length})
            </h4>
            <div className="space-y-1">
              {sortedLayers.map((layer, i) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedId(layer.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-all ${
                    selectedId === layer.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                    className="p-0.5 hover:text-foreground"
                  >
                    {layer.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
                  {layer.type === "text" ? (
                    <Type className="w-3 h-3" />
                  ) : (
                    <ImageIcon className="w-3 h-3" />
                  )}
                  <span className="flex-1 truncate">
                    {layer.content ?? "Image"}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLayerDown(layer.id); }}
                      disabled={i === 0}
                      className="p-0.5 hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLayerUp(layer.id); }}
                      disabled={i === sortedLayers.length - 1}
                      className="p-0.5 hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
              {layers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Aucun calque
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
