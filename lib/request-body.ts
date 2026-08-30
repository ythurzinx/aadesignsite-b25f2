import { NextRequest } from "next/server";

export class PayloadTooLargeError extends Error {}
export class UnsupportedContentTypeError extends Error {}

export async function readJsonObject(request: NextRequest, maxBytes: number) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new UnsupportedContentTypeError();

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0) throw new SyntaxError("invalid_content_length");
    if (length > maxBytes) throw new PayloadTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("empty_body");
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new SyntaxError("invalid_json_object");
  return parsed as Record<string, unknown>;
}
