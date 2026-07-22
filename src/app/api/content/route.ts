import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { contentAnalysisService } from "@/services/content-analysis.service";

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
    const { projectId, mode, text, fields, posterType } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "projectId requis" }, { status: 400 });
    }

    let content;

    if (mode === "quick" && text) {
      // Mode rapide : DeepSeek extrait les infos
      content = await contentAnalysisService.extractFromText(text);
    } else if (mode === "advanced" && fields) {
      // Mode avancé : données structurées directement
      content = {
        type: posterType ?? "custom",
        title: fields.title ?? "Sans titre",
        subtitle: fields.subtitle,
        description: fields.description,
        fields,
      };
    } else {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    // Save to project
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        poster_type: content.type,
        user_content: content as unknown as Record<string, unknown>,
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ content, success: true });
  } catch (error) {
    console.error("Content error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du contenu" },
      { status: 500 }
    );
  }
}
