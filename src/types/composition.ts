export interface CompositionLayer {
  id: string;
  type: "text" | "image" | "shape" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;

  // Text properties
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";

  // Image properties
  imageUrl?: string;
  objectFit?: "cover" | "contain" | "fill";

  // Shape properties
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface CompositionProject {
  width: number;
  height: number;
  backgroundColor: string;
  layers: CompositionLayer[];
}

export interface ExportOptions {
  format: "png" | "jpg" | "pdf";
  quality: number;
  width?: number;
  height?: number;
}
