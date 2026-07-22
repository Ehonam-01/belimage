import { createServerSideClient } from "@/lib/database/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, credits, role")
    .eq("id", user.id)
    .single();

  const profileData = profile as unknown as {
    id: string;
    email: string;
    full_name: string | null;
    credits: number;
    role: string;
  } | null;

  const credits = profileData?.credits ?? 0;
  const fullName = profileData?.full_name ?? user.email ?? "Créateur";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Bonjour, {fullName.split(" ")[0] ?? "Créateur"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue sur votre tableau de bord BelImage.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-secondary/50">
          <span className="text-sm text-muted-foreground">Crédits disponibles :</span>
          <span className="font-display font-bold text-2xl text-primary">{credits}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/projects"
            className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <h3 className="font-display font-semibold text-lg mb-2">
              Mes projets
            </h3>
            <p className="text-sm text-muted-foreground">
              Gérez et créez vos projets d&apos;affiches
            </p>
          </Link>

          <Link
            href="/projects/new"
            className="p-6 rounded-xl border bg-primary text-primary-foreground hover:shadow-md transition-shadow"
          >
            <h3 className="font-display font-semibold text-lg mb-2">
              Nouveau projet +
            </h3>
            <p className="text-sm opacity-90">
              Créez une nouvelle affiche à partir d&apos;un modèle
            </p>
          </Link>

          <Link
            href="/credits"
            className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <h3 className="font-display font-semibold text-lg mb-2">
              Crédits
            </h3>
            <p className="text-sm text-muted-foreground">
              {credits} crédits disponibles
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
