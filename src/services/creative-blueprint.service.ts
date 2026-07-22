import { createDeepSeekClient } from "@/lib/ai/deepseek/client";
import type { DesignAnalysis } from "@/types/design-analysis";
import type { CreativeBlueprint } from "@/types/blueprint";

const BLUEPRINT_SYSTEM_PROMPT = `Tu es un architecte créatif spécialisé dans la génération d'affiches.

Tu reçois :
1. Une analyse de design (structure du modèle original)
2. Un contenu utilisateur (informations à afficher)

Tu dois produire un plan de création complet (Creative Blueprint) en JSON.

Le blueprint doit contenir :
- preservedStructure : éléments du design original à conserver
- visualElementsToGenerate : éléments visuels à générer par l'IA d'images
- assetsToUse : assets importés par l'utilisateur à utiliser
- textElementsToCompose : textes à composer précisément (titre, date, prix, etc.)
- imageGenerationPrompt : prompt optimisé pour le générateur d'images
- negativePrompt : ce que le générateur d'images doit éviter
- compositionInstructions : instructions de composition

Règles importantes :
- Les textes (titre, date, prix, contact, CTA) doivent TOUJOURS être en textElementsToCompose, JAMAIS dans le prompt d'image
- Le prompt d'image doit décrire l'arrière-plan, l'ambiance, les éléments visuels
- Les positions doivent être relatives (0-1) au canvas
- Réponds UNIQUEMENT en JSON valide`;

export class CreativeBlueprintService {
  private deepseek = createDeepSeekClient();

  async generate(
    designAnalysis: DesignAnalysis,
    userContent: Record<string, unknown>,
    assets: { url: string; role: string }[] = []
  ): Promise<CreativeBlueprint> {
    try {
      const content = {
        type: (userContent.type as string) ?? "custom",
        title: (userContent.title as string) ?? "Sans titre",
        subtitle: userContent.subtitle as string,
        description: userContent.description as string,
        fields: (userContent.fields as Record<string, string>) ?? {},
      };

      const prompt = this.buildPrompt(designAnalysis, content, assets);

      const blueprint = await this.deepseek.chatJSON<CreativeBlueprint>(
        [
          { role: "system", content: BLUEPRINT_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        { temperature: 0.3, maxTokens: 4096 }
      );

      return this.validate(blueprint, content);
    } catch (error) {
      console.error("Blueprint generation failed:", error);
      throw new Error("La génération du blueprint a échoué.");
    }
  }

  private buildPrompt(
    design: DesignAnalysis,
    content: Record<string, unknown>,
    assets: { url: string; role: string }[]
  ): string {
    return `Génère un Creative Blueprint à partir des données suivantes :

## ANALYSE DU DESIGN
\`\`\`json
${JSON.stringify(design, null, 2)}
\`\`\`

## CONTENU UTILISATEUR
\`\`\`json
${JSON.stringify(content, null, 2)}
\`\`\`

## ASSETS DISPONIBLES
${assets.length > 0 ? JSON.stringify(assets, null, 2) : "Aucun asset fourni"}

## INSTRUCTIONS
1. Conserve la structure générale, composition et hiérarchie du design original
2. Remplace les éléments marqués "replaceable: true" par les nouvelles informations
3. Les textes doivent être composés précisément (titre, dates, prix, contacts)
4. Génère un prompt d'image pour créer l'arrière-plan et les éléments visuels
5. Assure la cohérence des couleurs avec la palette extraite
6. Produis des instructions de composition claires`;
  }

  private validate(
    blueprint: CreativeBlueprint,
    content: Record<string, unknown>
  ): CreativeBlueprint {
    return {
      preservedStructure: blueprint.preservedStructure ?? [],
      visualElementsToGenerate: blueprint.visualElementsToGenerate ?? [],
      assetsToUse: blueprint.assetsToUse ?? [],
      textElementsToCompose: this.ensureTitleInTexts(
        blueprint.textElementsToCompose ?? [],
        content
      ),
      imageGenerationPrompt:
        blueprint.imageGenerationPrompt ??
        "Génère un arrière-plan moderne et élégant pour une affiche",
      negativePrompt:
        blueprint.negativePrompt ??
        "Texte, écriture, lettres, mots, typographie, watermark, signature",
      compositionInstructions: blueprint.compositionInstructions ?? [],
    };
  }

  private ensureTitleInTexts(
    texts: CreativeBlueprint["textElementsToCompose"],
    content: Record<string, unknown>
  ): CreativeBlueprint["textElementsToCompose"] {
    const hasTitle = texts.some((t) => t.id === "main_title" || t.id === "headline");
    if (!hasTitle && content.title) {
      texts.unshift({
        id: "main_title",
        content: content.title as string,
        position: { x: 0.1, y: 0.1, width: 0.8, height: 0.15 },
        style: {
          fontFamily: "Inter",
          fontSize: 48,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
        },
        zIndex: 10,
      });
    }
    return texts;
  }
}

export const creativeBlueprintService = new CreativeBlueprintService();
