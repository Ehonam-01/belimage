import { getDefaultProvider, getProvider } from "@/lib/ai/image-providers/registry";
import type { GenerationParams, GenerationResult } from "@/lib/ai/image-providers/types";
import type { CreativeBlueprint } from "@/types/blueprint";

export class ImageGenerationService {
  async generateFromBlueprint(
    blueprint: CreativeBlueprint,
    canvasWidth = 1080,
    canvasHeight = 1350
  ): Promise<GenerationResult> {
    const provider = getDefaultProvider();

    const params: GenerationParams = {
      prompt: blueprint.imageGenerationPrompt,
      negativePrompt: blueprint.negativePrompt,
      width: canvasWidth,
      height: canvasHeight,
    };

    return provider.generateImage(params);
  }

  async generateVariants(
    blueprint: CreativeBlueprint,
    count: number,
    canvasWidth = 1080,
    canvasHeight = 1350
  ): Promise<GenerationResult[]> {
    const provider = getDefaultProvider();

    const params: GenerationParams = {
      prompt: blueprint.imageGenerationPrompt,
      negativePrompt: blueprint.negativePrompt,
      width: canvasWidth,
      height: canvasHeight,
    };

    return provider.generateVariants(params, count);
  }

  async generateWithProvider(
    providerName: string,
    params: GenerationParams
  ): Promise<GenerationResult> {
    const provider = getProvider(providerName);
    return provider.generateImage(params);
  }
}

export const imageGenerationService = new ImageGenerationService();
