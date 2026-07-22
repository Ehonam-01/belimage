export interface ContentBlueprint {
  type: "formation" | "event" | "product" | "birthday" | "custom";
  title: string;
  subtitle?: string;
  description?: string;
  fields: Record<string, string>;
}

export interface CreativeBlueprint {
  preservedStructure: string[];
  visualElementsToGenerate: VisualElementToGenerate[];
  assetsToUse: AssetToUse[];
  textElementsToCompose: TextElementToCompose[];
  imageGenerationPrompt: string;
  negativePrompt: string;
  compositionInstructions: CompositionInstruction[];
}

export interface VisualElementToGenerate {
  id: string;
  description: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
}

export interface AssetToUse {
  assetUrl: string;
  role: string;
  position: { x: number; y: number; width: number; height: number };
  zIndex: number;
}

export interface TextElementToCompose {
  id: string;
  content: string;
  position: { x: number; y: number; width: number; height: number };
  style: TextStyle;
  zIndex: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
}

export interface CompositionInstruction {
  elementId: string;
  action: "keep" | "replace" | "generate" | "compose";
  instruction: string;
}
