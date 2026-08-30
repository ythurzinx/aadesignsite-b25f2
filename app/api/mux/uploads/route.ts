import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin, requireAdmin } from "@/lib/admin-auth";
import { hasMuxConfig, muxRequest, type MuxUpload } from "@/lib/mux";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Sessão administrativa necessária." }, { status: 401 });
  }
  if (!hasMuxConfig()) {
    return NextResponse.json({ error: "Mux ainda não configurado no servidor." }, { status: 503 });
  }

  try {
    const response = await muxRequest<{ data: MuxUpload }>("/uploads", {
      method: "POST",
      body: JSON.stringify({
        cors_origin: request.headers.get("origin"),
        new_asset_settings: {
          playback_policies: ["public"],
          video_quality: "basic",
          max_resolution_tier: "2160p"
        }
      })
    });

    return NextResponse.json({ id: response.data.id, url: response.data.url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível iniciar o upload no Mux." }, { status: 502 });
  }
}
