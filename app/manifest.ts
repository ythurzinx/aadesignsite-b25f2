import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AA Design & Media",
    short_name: "AA Media",
    description: "Produção audiovisual em São Paulo",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0077b8",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ]
  };
}
