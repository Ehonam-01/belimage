import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return null;
        },
        set(_name, _value) {
          // Handled by response
        },
        remove(_name) {
          // Handled by response
        },
      },
    }
  );

  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");

  return response;
}
