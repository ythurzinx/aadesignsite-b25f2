import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { hasMuxConfig, muxRequest, type MuxAsset, type MuxUpload } from "@/lib/mux";

export const runtime = "nodejs";
const MUX_ID = /^[A-Za-z0-9_-]{6,100}$/;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Sessão administrativa necessária." }, { status: 401 });
  }
  if (!hasMuxConfig()) {
    return NextResponse.json({ error: "Mux ainda não configurado no servidor." }, { status: 503 });
  }

  const { id } = await params;
  if (!MUX_ID.test(id)) return NextResponse.json({ error: "Upload inválido." }, { status: 400 });

  try {
    const upload = await muxRequest<{ data: MuxUpload }>(`/uploads/${encodeURIComponent(id)}`);
    if (!upload.data.asset_id) {
      return NextResponse.json({ uploadId: upload.data.id, status: upload.data.status });
    }

    const asset = await muxRequest<{ data: MuxAsset }>(`/assets/${encodeURIComponent(upload.data.asset_id)}`);
    const playbackId = asset.data.playback_ids?.find((item) => item.policy === "public")?.id ?? null;
    return NextResponse.json({
      uploadId: upload.data.id,
      assetId: asset.data.id,
      playbackId,
      status: asset.data.status,
      error: asset.data.errors?.messages?.[0] ?? null
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o processamento." }, { status: 502 });
  }
}
