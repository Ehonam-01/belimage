import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { creativeBlueprintService } from "@/services/creative-blueprint.service";

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
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId requis" }, { status: 400 });
    }

    // Get project data
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
      reference_analysis: Record<string, unknown> | null;
      user_content: Record<string, unknown> | null;
    };

    if (!projectData.reference_analysis || !projectData.user_content) {
      return NextResponse.json(
        { error: "Analyse du design et contenu requis" },
        { status: 400 }
      );
    }

    // Get assets
    const { data: assets } = await supabase
      .from("assets")
      .select("file_url, role")
      .eq("project_id", projectId);

    const assetList = (assets ?? []) as unknown as { file_url: string; role: string }[];

    // Generate blueprint
    const blueprint = await creativeBlueprintService.generate(
      projectData.reference_analysis as any,
      projectData.user_content,
      assetList.map((a) => ({ url: a.file_url, role: a.role }))
    );

    // Save blueprint
    await supabase
      .from("projects")
      .update({
        creative_blueprint: blueprint as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return NextResponse.json({ blueprint, success: true });
  } catch (error) {
    console.error("Blueprint error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur du blueprint" },
      { status: 500 }
    );
  }
}
