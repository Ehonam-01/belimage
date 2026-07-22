import type { ImageGenerationProvider } from "./types";
import { ReplicateProvider } from "./replicate.provider";

const providers = new Map<string, ImageGenerationProvider>();

export function registerProvider(provider: ImageGenerationProvider) {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): ImageGenerationProvider {
  const provider = providers.get(name);
  if (!provider) {
    throw new Error(`Provider "${name}" non trouvé. Disponibles : ${Array.from(providers.keys()).join(", ")}`);
  }
  return provider;
}

export function getDefaultProvider(): ImageGenerationProvider {
  return getProvider("replicate");
}

export function listProviders(): string[] {
  return Array.from(providers.keys());
}

// Register default providers
registerProvider(new ReplicateProvider());
