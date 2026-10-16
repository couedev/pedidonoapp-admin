import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AdminNoApp",
    short_name: "AdminNoApp",
    description: "Painel administrativo do Pedidonoapp.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    icons: [
      {
        src: "/icons/icon-adminnoapp-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-adminnoapp-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
