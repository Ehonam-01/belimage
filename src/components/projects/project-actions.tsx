"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit3,
  Trash2,
  Copy,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string | null;
}

export function ProjectActions({
  projectId,
  projectTitle,
  projectDescription,
}: ProjectActionsProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(projectTitle);
  const [description, setDescription] = useState(projectDescription ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("edit");

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Projet modifié");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement ce projet ?")) return;
    setLoading("delete");

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Projet supprimé");
      router.push("/projects");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(null);
    }
  };

  const handleDuplicate = async () => {
    setLoading("duplicate");

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      const data = await res.json();
      toast.success("Projet dupliqué");
      router.push(`/projects/${data.id}`);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la duplication");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          className="gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          disabled={loading === "duplicate"}
          className="gap-2"
        >
          {loading === "duplicate" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          Dupliquer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={loading === "delete"}
          className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
        >
          {loading === "delete" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Supprimer
        </Button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">
              Modifier le projet
            </h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Input
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading === "edit"}>
                  {loading === "edit" ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
