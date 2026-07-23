import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createCompositionEngine } from "@/lib/composition/engine";

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return null; },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { projectId, layers } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId requis" }, { status: 400 });
    }

    // Get project
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    const projectData = project as unknown as {
      generated_images: { url: string; provider: string }[] | null;
    };

    // Build composition from generated images
    const backgroundImage = projectData.generated_images?.[0]?.url;
    if (!backgroundImage) {
      return NextResponse.json(
        { error: "Aucune image générée. Générez d'abord l'image." },
        { status: 400 }
      );
    }

    const engine = createCompositionEngine({
      width: 1080,
      height: 1350,
      backgroundImage,
    });

    // Add provided layers or use defaults
    if (layers && Array.isArray(layers)) {
      for (const layer of layers) {
        engine.addLayer(layer);
      }
    }

    // Save composition data to project
    const compositionExport = engine.getExportData();
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        composition_data: compositionExport as unknown as Record<string, unknown>,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (updateError) {
      console.error("Save composition error:", updateError);
    }

    return NextResponse.json({
      composition: compositionExport,
      css: engine.toCSS(),
      success: true,
    });
  } catch (error) {
    console.error("Composition error:", error);
    return NextResponse.json(
      { error: "Erreur de composition" },
      { status: 500 }
    );
  }
}
