import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Layers, Wand2, Download } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">BelImage</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Wand2 className="w-4 h-4" />
            SaaS IA de génération d&apos;affiches
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            Créez des affiches
            <br />
            <span className="text-primary">professionnelles</span> par IA
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Importez un modèle, décrivez votre contenu, et laissez l&apos;IA
            générer une affiche personnalisée en conservant le style et la
            composition de votre référence.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Comment ça fonctionne
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-xl bg-background border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Layers className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">
                1. Importez un modèle
              </h3>
              <p className="text-muted-foreground">
                Téléchargez l&apos;affiche que vous souhaitez utiliser comme
                référence. L&apos;IA analyse sa composition, ses couleurs et sa
                structure.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-background border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">
                2. Décrivez votre contenu
              </h3>
              <p className="text-muted-foreground">
                En mode rapide ou avancé, fournissez vos informations. L&apos;IA
                les structure et les adapte au modèle.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-background border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Download className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg">
                3. Générez &amp; exportez
              </h3>
              <p className="text-muted-foreground">
                L&apos;IA génère votre affiche. Modifiez les textes, déplacez
                les éléments, puis exportez en haute résolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BelImage. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
