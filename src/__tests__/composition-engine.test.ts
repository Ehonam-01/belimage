import { describe, it, expect } from "vitest";
import { createCompositionEngine } from "@/lib/composition/engine";

describe("CompositionEngine", () => {
  it("creates an engine with default values", () => {
    const engine = createCompositionEngine();
    const project = engine.getProject();
    expect(project.width).toBe(1080);
    expect(project.height).toBe(1350);
    expect(project.backgroundColor).toBe("#FFFFFF");
    expect(project.layers).toEqual([]);
  });

  it("creates an engine with custom values", () => {
    const engine = createCompositionEngine({ width: 800, height: 600 });
    expect(engine.getProject().width).toBe(800);
    expect(engine.getProject().height).toBe(600);
  });

  it("adds a layer and returns it with defaults", () => {
    const engine = createCompositionEngine();
    const layer = engine.addLayer({
      type: "text",
      x: 10,
      y: 20,
      width: 300,
      height: 50,
      content: "Hello",
    });
    expect(layer.id).toBeDefined();
    expect(layer.type).toBe("text");
    expect(layer.x).toBe(10);
    expect(layer.y).toBe(20);
    expect(layer.content).toBe("Hello");
    expect(layer.visible).toBe(true);
    expect(layer.locked).toBe(false);
    expect(layer.zIndex).toBe(1);
  });

  it("adds multiple layers with incrementing zIndex", () => {
    const engine = createCompositionEngine();
    engine.addLayer({ type: "text", x: 0, y: 0, width: 100, height: 50 });
    engine.addLayer({ type: "image", x: 0, y: 0, width: 200, height: 200 });
    const layers = engine.getLayers();
    expect(layers).toHaveLength(2);
    expect(layers[0]!.zIndex).toBe(1);
    expect(layers[1]!.zIndex).toBe(2);
  });

  it("updates a layer", () => {
    const engine = createCompositionEngine();
    const layer = engine.addLayer({
      type: "text",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      content: "Old",
    });
    engine.updateLayer(layer.id, { content: "Updated", x: 50 });
    const updated = engine.getLayers()[0]!;
    expect(updated.content).toBe("Updated");
    expect(updated.x).toBe(50);
    expect(updated.y).toBe(0); // unchanged
  });

  it("removes a layer", () => {
    const engine = createCompositionEngine();
    const layer = engine.addLayer({
      type: "text",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
    expect(engine.getLayers()).toHaveLength(1);
    engine.removeLayer(layer.id);
    expect(engine.getLayers()).toHaveLength(0);
  });

  it("sets background image", () => {
    const engine = createCompositionEngine();
    engine.setBackground("https://example.com/bg.jpg");
    expect(engine.getProject().backgroundImage).toBe(
      "https://example.com/bg.jpg"
    );
  });

  it("sets size", () => {
    const engine = createCompositionEngine();
    engine.setSize(1920, 1080);
    expect(engine.getProject().width).toBe(1920);
    expect(engine.getProject().height).toBe(1080);
  });

  it("gets only visible layers", () => {
    const engine = createCompositionEngine();
    const visible = engine.addLayer({
      type: "text",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });
    const hidden = engine.addLayer({
      type: "image",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    engine.updateLayer(hidden.id, { visible: false });
    expect(engine.getVisibleLayers()).toHaveLength(1);
    expect(engine.getVisibleLayers()[0]!.id).toBe(visible.id);
  });

  it("generates CSS from layers", () => {
    const engine = createCompositionEngine();
    engine.addLayer({
      type: "text",
      x: 50,
      y: 100,
      width: 300,
      height: 60,
      content: "Hello",
      fontSize: 32,
      fontWeight: 700,
      color: "#FFFFFF",
      textAlign: "center",
    });
    const css = engine.toCSS();
    expect(css).toContain("#layer_");
    expect(css).toContain("font-size: 32px");
    expect(css).toContain("font-weight: 700");
    expect(css).toContain("color: #FFFFFF");
    expect(css).toContain("text-align: center");
  });

  it("exports project data", () => {
    const engine = createCompositionEngine();
    engine.setBackground("https://example.com/bg.jpg");
    engine.addLayer({ type: "text", x: 0, y: 0, width: 100, height: 50 });
    const exportData = engine.getExportData();
    expect(exportData.project).toBeDefined();
    expect(exportData.project.backgroundImage).toBe(
      "https://example.com/bg.jpg"
    );
    expect(exportData.export.format).toBe("png");
    expect(exportData.export.quality).toBe(95);
  });
});
