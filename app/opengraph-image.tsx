import { ImageResponse } from "next/og";

export const alt = "AA Design & Media";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#ffffff,#eef8fc 58%,#e7f5fb)", color: "#102a43", fontFamily: "Arial" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 62, height: 62, borderRadius: 18, background: "#0077b8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22 }}>AA</div><div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 4 }}>DESIGN &amp; MEDIA</div></div>
      <div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 800, lineHeight: .94, letterSpacing: -5 }}><span>CRIAMOS EXPERIÊNCIAS.</span><span style={{ color: "#0077b8" }}>CONTAMOS HISTÓRIAS.</span></div><div style={{ marginTop: 28, color: "#005a9c", fontSize: 20, letterSpacing: 4 }}>PRODUÇÃO AUDIOVISUAL · SÃO PAULO</div></div>
    </div>,
    size
  );
}
