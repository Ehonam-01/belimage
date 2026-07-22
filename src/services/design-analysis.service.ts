import { createDeepSeekClient } from "@/lib/ai/deepseek/client";
import {
  DESIGN_ANALYSIS_SYSTEM_PROMPT,
  buildDesignAnalysisPrompt,
} from "@/lib/ai/deepseek/prompts";
import type { DesignAnalysis } from "@/types/design-analysis";

export class DesignAnalysisService {
  private deepseek = createDeepSeekClient();

  async analyze(imageUrl: string): Promise<DesignAnalysis> {
    try {
      const analysis = await this.deepseek.chatJSON<DesignAnalysis>(
        [
          { role: "system", content: DESIGN_ANALYSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyse le design de cette affiche : ${imageUrl}`,
          },
        ],
        { temperature: 0.2 }
      );

      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error("Design analysis failed:", error);
      throw new Error(
        "L'analyse du design a échoué. Veuillez réessayer."
      );
    }
  }

  async analyzeWithDescription(imageUrl: string, description?: string): Promise<DesignAnalysis> {
    const prompt = description
      ? `Analyse le design de cette affiche : ${imageUrl}\n\nContexte supplémentaire : ${description}`
      : buildDesignAnalysisPrompt(imageUrl);

    try {
      const analysis = await this.deepseek.chatJSON<DesignAnalysis>(
        [
          { role: "system", content: DESIGN_ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        { temperature: 0.2 }
      );

      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error("Design analysis failed:", error);
      throw new Error("L'analyse du design a échoué.");
    }
  }

  private validateAnalysis(analysis: DesignAnalysis): DesignAnalysis {
    if (!analysis.canvas?.width || !analysis.canvas?.height) {
      analysis.canvas = { width: 1080, height: 1350, aspectRatio: "4:5" };
    }

    if (!analysis.canvas.aspectRatio) {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(analysis.canvas.width, analysis.canvas.height);
      analysis.canvas.aspectRatio = `${analysis.canvas.width / divisor}:${analysis.canvas.height / divisor}`;
    }

    if (!Array.isArray(analysis.colorPalette)) {
      analysis.colorPalette = [];
    }

    if (!Array.isArray(analysis.elements)) {
      analysis.elements = [];
    }

    if (!Array.isArray(analysis.designRules)) {
      analysis.designRules = [];
    }

    if (!analysis.layout?.visualHierarchy) {
      analysis.layout = {
        ...analysis.layout,
        visualHierarchy: ["main_title", "main_subject", "secondary_information", "call_to_action"],
      };
    }

    return analysis;
  }
}

export const designAnalysisService = new DesignAnalysisService();
