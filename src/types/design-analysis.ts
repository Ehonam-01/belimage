export interface CanvasInfo {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface VisualStyle {
  category: string;
  mood: string;
  energy: "low" | "medium" | "high";
}

export interface ColorInfo {
  color: string;
  role: string;
}

export interface LayoutInfo {
  composition: string;
  alignment: string;
  visualHierarchy: string[];
}

export interface DesignElement {
  id: string;
  type: "person" | "product" | "text" | "logo" | "shape" | "decoration" | "background" | "cta";
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  importance: "critical" | "high" | "medium" | "low";
  replaceable: boolean;
  mustBeComposedPrecisely?: boolean;
}

export interface DesignAnalysis {
  canvas: CanvasInfo;
  visualStyle: VisualStyle;
  colorPalette: ColorInfo[];
  layout: LayoutInfo;
  elements: DesignElement[];
  designRules: string[];
}
