"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  LogOut,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projets",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Crédits",
    href: "/credits",
    icon: Coins,
  },
];

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath = "" }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Déconnexion réussie");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-xl">BelImage</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
