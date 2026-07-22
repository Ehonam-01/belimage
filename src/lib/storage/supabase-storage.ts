import { createClient } from "@/lib/database/client";

const BUCKETS = {
  referenceModels: "reference-models",
  userAssets: "user-assets",
  generatedImages: "generated-images",
  finalPosters: "final-posters",
} as const;

export async function uploadFile(
  bucket: keyof typeof BUCKETS,
  filePath: string,
  file: File
) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKETS[bucket])
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;
  return data;
}

export async function getPublicUrl(
  bucket: keyof typeof BUCKETS,
  filePath: string
) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteFile(
  bucket: keyof typeof BUCKETS,
  filePath: string
) {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKETS[bucket])
    .remove([filePath]);

  if (error) throw error;
}

export function generateFilePath(
  userId: string,
  projectId: string,
  fileName: string
) {
  const timestamp = Date.now();
  const ext = fileName.split(".").pop();
  return `${userId}/${projectId}/${timestamp}.${ext}`;
}
