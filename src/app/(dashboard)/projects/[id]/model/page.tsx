"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function ModelImportPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(selected.type)) {
      toast.error("Format accepté : PNG, JPG, WEBP");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10MB)");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("bucket", "reference-models");
      formData.append("role", "model");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      setUploaded(true);
      toast.success("Modèle importé avec succès !");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
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
            Importer un modèle
          </h1>
          <p className="text-muted-foreground mt-1">
            Téléchargez l&apos;affiche modèle que vous souhaitez utiliser
            comme référence pour la génération.
          </p>
        </div>

        {/* Upload zone */}
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-16 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-4">
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">
              Cliquez pour importer
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              PNG, JPG ou WEBP — Max 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button type="button" variant="secondary" size="sm">
              Choisir un fichier
            </Button>
          </div>
        ) : (
          /* Preview */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border bg-muted/30">
              <div className="relative max-h-[600px] flex items-center justify-center p-4">
                <Image
                  src={preview}
                  alt="Aperçu du modèle"
                  width={400}
                  height={500}
                  className="rounded-lg object-contain max-h-[500px] shadow-sm"
                />
              </div>
              {uploaded && (
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Importé
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </p>
                </div>
              </div>
              {!uploaded && (
                <button
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!uploaded ? (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importation...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Importer le modèle
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    Annuler
                  </Button>
                </>
              ) : (
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={handleRemove}
                    className="flex-1"
                  >
                    Changer de modèle
                  </Button>
                  <Button
                    onClick={() => router.push(`/projects/${projectId}`)}
                    className="flex-1"
                  >
                    Continuer
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
