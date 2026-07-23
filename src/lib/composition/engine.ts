import type { CompositionLayer, CompositionProject, CompositionExport } from "./types";

export class CompositionEngine {
  private project: CompositionProject;

  constructor(project?: Partial<CompositionProject>) {
    this.project = {
      width: project?.width ?? 1080,
      height: project?.height ?? 1350,
      backgroundColor: project?.backgroundColor ?? "#FFFFFF",
      backgroundImage: project?.backgroundImage,
      layers: project?.layers ?? [],
    };
  }

  getProject(): CompositionProject {
    return { ...this.project, layers: [...this.project.layers] };
  }

  setBackground(imageUrl: string) {
    this.project.backgroundImage = imageUrl;
  }

  setSize(width: number, height: number) {
    this.project.width = width;
    this.project.height = height;
  }

  // Layer management
  addLayer(layer: Omit<CompositionLayer, "id" | "zIndex" | "visible" | "locked">): CompositionLayer {
    const newLayer: CompositionLayer = {
      ...layer,
      id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      zIndex: this.project.layers.length + 1,
      visible: true,
      locked: false,
    };
    this.project.layers.push(newLayer);
    return newLayer;
  }

  updateLayer(id: string, changes: Partial<CompositionLayer>) {
    const index = this.project.layers.findIndex((l) => l.id === id);
    if (index !== -1) {
      const existing = this.project.layers[index]!;
      this.project.layers[index] = {
        ...existing,
        ...changes,
        id: existing.id,
        type: existing.type,
        zIndex: changes.zIndex ?? existing.zIndex,
        visible: changes.visible ?? existing.visible,
        locked: changes.locked ?? existing.locked,
      } as CompositionLayer;
    }
  }

  removeLayer(id: string) {
    this.project.layers = this.project.layers.filter((l) => l.id !== id);
  }

  moveLayer(id: string, newZIndex: number) {
    const layer = this.project.layers.find((l) => l.id === id);
    if (layer) {
      layer.zIndex = newZIndex;
      this.project.layers.sort((a, b) => a.zIndex - b.zIndex);
    }
  }

  getLayers(): CompositionLayer[] {
    return [...this.project.layers].sort((a, b) => a.zIndex - b.zIndex);
  }

  getVisibleLayers(): CompositionLayer[] {
    return this.getLayers().filter((l) => l.visible);
  }

  // Blueprint to composition
  fromBlueprint(
    blueprint: {
      textElementsToCompose: Array<{
        id: string;
        content: string;
        position: { x: number; y: number; width: number; height: number };
        style: {
          fontFamily?: string;
          fontSize?: number;
          fontWeight?: number;
          color?: string;
          textAlign?: string;
        };
        zIndex?: number;
      }>;
      assetsToUse?: Array<{
        assetUrl: string;
        role: string;
        position: { x: number; y: number; width: number; height: number };
        zIndex?: number;
      }>;
    },
    canvasWidth: number,
    canvasHeight: number
  ) {
    // Clear existing layers
    this.project.layers = [];

    // Add text layers
    for (const text of blueprint.textElementsToCompose) {
      this.project.layers.push({
        id: text.id,
        type: "text",
        x: text.position.x * canvasWidth,
        y: text.position.y * canvasHeight,
        width: text.position.width * canvasWidth,
        height: text.position.height * canvasHeight,
        zIndex: text.zIndex ?? 10,
        visible: true,
        locked: false,
        content: text.content,
        fontFamily: text.style.fontFamily ?? "Inter",
        fontSize: text.style.fontSize ?? 32,
        fontWeight: text.style.fontWeight ?? 700,
        color: text.style.color ?? "#FFFFFF",
        textAlign: (text.style.textAlign as "left" | "center" | "right") ?? "center",
      });
    }

    // Add asset layers
    if (blueprint.assetsToUse) {
      for (const asset of blueprint.assetsToUse) {
        this.project.layers.push({
          id: `asset_${asset.role}`,
          type: "image",
          x: asset.position.x * canvasWidth,
          y: asset.position.y * canvasHeight,
          width: asset.position.width * canvasWidth,
          height: asset.position.height * canvasHeight,
          zIndex: asset.zIndex ?? 5,
          visible: true,
          locked: false,
          imageUrl: asset.assetUrl,
          objectFit: "cover",
        });
      }
    }
  }

  // Export
  getExportData(): { project: CompositionProject; export: CompositionExport } {
    return {
      project: this.getProject(),
      export: {
        format: "png",
        quality: 95,
        width: this.project.width,
        height: this.project.height,
      },
    };
  }

  toCSS(): string {
    const layers = this.getVisibleLayers();
    return layers
      .map(
        (layer) => `
  #${layer.id} {
    position: absolute;
    left: ${layer.x}px;
    top: ${layer.y}px;
    width: ${layer.width}px;
    height: ${layer.height}px;
    z-index: ${layer.zIndex};
    opacity: ${layer.opacity ?? 1};
    ${layer.type === "text" ? `
    font-family: ${layer.fontFamily ?? "Inter"}, sans-serif;
    font-size: ${layer.fontSize ?? 32}px;
    font-weight: ${layer.fontWeight ?? 400};
    color: ${layer.color ?? "#000000"};
    text-align: ${layer.textAlign ?? "left"};
    ${layer.letterSpacing ? `letter-spacing: ${layer.letterSpacing}px;` : ""}
    ${layer.lineHeight ? `line-height: ${layer.lineHeight};` : ""}
    ${layer.textTransform ? `text-transform: ${layer.textTransform};` : ""}
    ` : ""}
    ${layer.type === "image" ? `
    background-image: url(${layer.imageUrl});
    background-size: ${layer.objectFit ?? "cover"};
    background-position: center;
    ` : ""}
    ${layer.borderRadius ? `border-radius: ${layer.borderRadius}px;` : ""}
    ${layer.backgroundColor ? `background-color: ${layer.backgroundColor};` : ""}
  }`
      )
      .join("\n");
  }
}

export function createCompositionEngine(project?: Partial<CompositionProject>) {
  return new CompositionEngine(project);
}
