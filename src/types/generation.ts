export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  style?: string;
  referenceImage?: string;
  strength?: number;
  seed?: number;
}

export interface GenerationResult {
  url: string;
  provider: string;
  width: number;
  height: number;
  seed?: number;
  cost: number;
}

export interface EditImageParams {
  imageUrl: string;
  prompt: string;
  mask?: string;
  strength?: number;
}

export interface ImageGenerationProvider {
  name: string;
  generateImage(params: GenerationParams): Promise<GenerationResult>;
  generateVariants(
    params: GenerationParams,
    count: number
  ): Promise<GenerationResult[]>;
  editImage(params: EditImageParams): Promise<GenerationResult>;
}
