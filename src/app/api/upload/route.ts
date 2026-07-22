import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateFilePath, getPublicUrl } from "@/lib/storage/supabase-storage";

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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const bucket = (formData.get("bucket") as string) ?? "reference-models";
    const role = (formData.get("role") as string) ?? "model";

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Fichier ou projectId manquant" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format accepté : PNG, JPG, WEBP" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const filePath = generateFilePath(user.id, projectId, file.name);
    const supabaseClient = createServerClient(
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

    const { error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'upload" },
        { status: 500 }
      );
    }

    const publicUrl = getPublicUrl(bucket as any, filePath);

    // Save asset in database
    if (role === "model") {
      await supabaseClient
        .from("projects")
        .update({
          reference_model_url: publicUrl,
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("user_id", user.id);
    }

    // Save in assets table
    await supabaseClient.from("assets").insert({
      project_id: projectId,
      user_id: user.id,
      file_url: publicUrl,
      file_type: file.type.startsWith("image/") ? "image" : "image",
      role: role,
      label: file.name,
      width: 0,
      height: 0,
      file_size: file.size,
    });

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
