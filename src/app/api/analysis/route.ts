import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { designAnalysisService } from "@/services/design-analysis.service";

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
    const { projectId, imageUrl } = await request.json();

    if (!projectId || !imageUrl) {
      return NextResponse.json(
        { error: "projectId et imageUrl requis" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    // Update status to analyzing
    await supabase
      .from("projects")
      .update({ status: "analyzing", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    // Run analysis
    const analysis = await designAnalysisService.analyze(imageUrl);

    // Save analysis
    await supabase
      .from("projects")
      .update({
        reference_analysis: analysis as unknown as Record<string, unknown>,
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return NextResponse.json({ analysis, success: true });
  } catch (error) {
    console.error("Analysis error:", error);

    // Reset status on failure
    if (error instanceof Error) {
      const msg = error.message;
      return NextResponse.json(
        { error: msg, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'analyse", success: false },
      { status: 500 }
    );
  }
}
