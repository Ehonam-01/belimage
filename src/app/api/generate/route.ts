import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { imageGenerationService } from "@/services/image-generation.service";

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
    const { projectId, variants = 1 } = await request.json();
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
      creative_blueprint: Record<string, unknown> | null;
    };

    if (!projectData.creative_blueprint) {
      return NextResponse.json(
        { error: "Blueprint requis. Génère d'abord le blueprint." },
        { status: 400 }
      );
    }

    // Update status
    await supabase
      .from("projects")
      .update({
        status: "generating",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    // Generate images
    const results = variants > 1
      ? await imageGenerationService.generateVariants(
          projectData.creative_blueprint as any,
          variants
        )
      : [await imageGenerationService.generateFromBlueprint(
          projectData.creative_blueprint as any
        )];

    // Save results
    const generationRecords = results.map((result, i) => ({
      project_id: projectId,
      user_id: user.id,
      variant_index: i,
      status: "completed" as const,
      provider_used: result.provider,
      prompt_sent: (projectData.creative_blueprint as any)?.imageGenerationPrompt ?? "",
      result_url: result.url,
      credits_cost: result.cost,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }));

    const { error: genError } = await supabase
      .from("generations")
      .insert(generationRecords as any);

    if (genError) {
      console.error("Save generations error:", genError);
    }

    // Update project with generated images
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        generated_images: results.map((r) => ({ url: r.url, provider: r.provider })),
        status: "composing",
        credits_consumed: results.reduce((sum, r) => sum + r.cost, 0),
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (updateError) {
      console.error("Update project error:", updateError);
    }

    return NextResponse.json({
      results,
      success: true,
    });
  } catch (error) {
    console.error("Generation error:", error);

    // Reset status on failure
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Erreur de génération" },
      { status: 500 }
    );
  }
}
