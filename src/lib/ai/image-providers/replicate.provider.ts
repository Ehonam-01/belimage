import type {
  ImageGenerationProvider,
  GenerationParams,
  GenerationResult,
  EditImageParams,
} from "./types";

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string | string[] | null;
  error: string | null;
}

export class ReplicateProvider implements ImageGenerationProvider {
  readonly name = "replicate";

  async generateImage(params: GenerationParams): Promise<GenerationResult> {
    const prediction = await this.createPrediction(params);
    const result = await this.waitForCompletion(prediction.id);
    return this.toResult(result, params);
  }

  async generateVariants(
    params: GenerationParams,
    count: number
  ): Promise<GenerationResult[]> {
    const promises = Array.from({ length: count }, (_, i) =>
      this.generateImage({ ...params, seed: params.seed ?? i * 1000 })
    );
    return Promise.all(promises);
  }

  async editImage(_params: EditImageParams): Promise<GenerationResult> {
    throw new Error("Edit image not supported by Replicate provider");
  }

  private async createPrediction(
    params: GenerationParams
  ): Promise<ReplicatePrediction> {
    const version =
      params.style === "realistic"
        ? "black-forest-labs/flux-schnell"
        : "black-forest-labs/flux-1.1-pro";

    const body = {
      input: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt ?? "",
        width: params.width,
        height: params.height,
        num_outputs: 1,
        ...(params.seed ? { seed: params.seed } : {}),
      },
    };

    const response = await fetch(
      `https://api.replicate.com/v1/models/${version}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Replicate API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<ReplicatePrediction>;
  }

  private async waitForCompletion(
    predictionId: string,
    maxRetries = 30
  ): Promise<ReplicatePrediction> {
    for (let i = 0; i < maxRetries; i++) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      const prediction =
        (await response.json()) as ReplicatePrediction;

      if (prediction.status === "succeeded") return prediction;
      if (prediction.status === "failed") {
        throw new Error(prediction.error ?? "Génération échouée");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("Timeout: la génération a pris trop de temps");
  }

  private toResult(
    prediction: ReplicatePrediction,
    params: GenerationParams
  ): GenerationResult {
    const outputUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    return {
      url: outputUrl ?? "",
      provider: this.name,
      width: params.width,
      height: params.height,
      seed: params.seed,
      cost: 1,
    };
  }
}
