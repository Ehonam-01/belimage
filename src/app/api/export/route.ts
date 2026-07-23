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
    const { projectId, layers, width = 1080, height = 1350 } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId requis" }, { status: 400 });
    }

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

    const bg = projectData.generated_images?.[0]?.url;

    // Build composition engine
    const engine = createCompositionEngine({
      width,
      height,
      backgroundImage: bg,
    });

    if (layers && Array.isArray(layers)) {
      for (const layer of layers) {
        engine.addLayer(layer);
      }
    }

    // Generate CSS for rendering
    const css = engine.toCSS();
    const html = bg ? `
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
#poster {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  background-image: url(${bg});
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
${css}
.text-layer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  overflow: hidden;
  word-break: break-word;
}
</style>
</head>
<body>
<div id="poster">
${(layers ?? []).map((l: any) => `
  <div id="${l.id}" class="${l.type === 'text' ? 'text-layer' : ''}" style="
    position: absolute;
    left: ${l.x}px;
    top: ${l.y}px;
    width: ${l.width}px;
    height: ${l.height}px;
    z-index: ${l.zIndex ?? 1};
    opacity: ${l.opacity ?? 1};
    ${l.type === 'text' ? `
    font-family: ${l.fontFamily ?? 'Inter'}, sans-serif;
    font-size: ${l.fontSize ?? 32}px;
    font-weight: ${l.fontWeight ?? 400};
    color: ${l.color ?? '#000'};
    text-align: ${l.textAlign ?? 'left'};
    ` : ''}
    ${l.type === 'image' ? `
    background-image: url(${l.imageUrl});
    background-size: ${l.objectFit ?? 'cover'};
    background-position: center;
    ` : ''}
  ">${l.type === 'text' ? l.content ?? '' : ''}</div>
`).join('\n')}
</div>
</body>
</html>`.trim() : '';

    return NextResponse.json({
      html,
      css,
      success: true,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Erreur d'export" }, { status: 500 });
  }
}
