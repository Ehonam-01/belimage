import { createDeepSeekClient } from "@/lib/ai/deepseek/client";
import { CONTENT_EXTRACTION_SYSTEM_PROMPT } from "@/lib/ai/deepseek/prompts";

export interface ExtractedContent {
  type: "formation" | "event" | "product" | "birthday" | "custom";
  title: string;
  subtitle?: string;
  description?: string;
  fields: Record<string, string>;
}

export class ContentAnalysisService {
  private deepseek = createDeepSeekClient();

  async extractFromText(userText: string): Promise<ExtractedContent> {
    try {
      const content = await this.deepseek.chatJSON<ExtractedContent>(
        [
          { role: "system", content: CONTENT_EXTRACTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extrais les informations structurées de ce texte : "${userText}"`,
          },
        ],
        { temperature: 0.2 }
      );

      return this.validate(content);
    } catch (error) {
      console.error("Content extraction failed:", error);
      throw new Error("Impossible d'extraire le contenu. Veuillez utiliser le mode avancé.");
    }
  }

  private validate(content: ExtractedContent): ExtractedContent {
    return {
      type: content.type ?? "custom",
      title: content.title ?? "Sans titre",
      subtitle: content.subtitle,
      description: content.description,
      fields: content.fields ?? {},
    };
  }

  getFieldsForType(type: ExtractedContent["type"]) {
    const fields: Record<string, { label: string; placeholder: string; required?: boolean }> = {};

    switch (type) {
      case "formation":
        fields.title = { label: "Titre de la formation", placeholder: "Formation Vibe Coding", required: true };
        fields.subtitle = { label: "Sous-titre", placeholder: "Apprenez à coder avec l'IA" };
        fields.trainer = { label: "Formateur", placeholder: "Jean Dupont", required: true };
        fields.date = { label: "Date", placeholder: "25 août 2026", required: true };
        fields.time = { label: "Heure", placeholder: "19h00" };
        fields.location = { label: "Lieu", placeholder: "Salle 3, Dakar" };
        fields.price = { label: "Prix", placeholder: "15 000 FCFA" };
        fields.program = { label: "Programme", placeholder: "Introduction, pratique, Q&A" };
        fields.contact = { label: "Contact", placeholder: "+221 77 123 45 67" };
        fields.cta = { label: "CTA", placeholder: "Inscrivez-vous maintenant" };
        break;

      case "event":
        fields.title = { label: "Nom de l'événement", placeholder: "Concert de jazz", required: true };
        fields.date = { label: "Date", placeholder: "15 septembre 2026", required: true };
        fields.time = { label: "Heure", placeholder: "20h00" };
        fields.location = { label: "Lieu", placeholder: "Théâtre national" };
        fields.guests = { label: "Invités", placeholder: "Artiste invité" };
        fields.price = { label: "Prix", placeholder: "5 000 FCFA" };
        fields.contact = { label: "Contact", placeholder: "+221 77 123 45 67" };
        break;

      case "product":
        fields.title = { label: "Nom du produit", placeholder: "Smartphone X Pro", required: true };
        fields.price = { label: "Prix", placeholder: "250 000 FCFA", required: true };
        fields.discount = { label: "Réduction", placeholder: "-20%" };
        fields.features = { label: "Caractéristiques", placeholder: "4K, 128GB, 5G" };
        fields.cta = { label: "CTA", placeholder: "Acheter maintenant" };
        fields.contact = { label: "Contact", placeholder: "+221 77 123 45 67" };
        break;

      case "birthday":
        fields.title = { label: "Nom", placeholder: "Joyeux anniversaire Marie !", required: true };
        fields.age = { label: "Âge", placeholder: "30 ans" };
        fields.date = { label: "Date", placeholder: "10 août 2026", required: true };
        fields.location = { label: "Lieu", placeholder: "Restaurant Le Dakar" };
        fields.message = { label: "Message", placeholder: "Que cette journée soit spéciale" };
        break;

      default:
        fields.title = { label: "Titre", placeholder: "Titre de votre affiche", required: true };
        fields.subtitle = { label: "Sous-titre", placeholder: "Sous-titre optionnel" };
        fields.description = { label: "Description", placeholder: "Description de votre affiche" };
        fields.cta = { label: "CTA", placeholder: "Appel à l'action" };
        fields.contact = { label: "Contact", placeholder: "Votre contact" };
    }

    return fields;
  }
}

export const contentAnalysisService = new ContentAnalysisService();
