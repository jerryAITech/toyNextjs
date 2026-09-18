import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ToyStore — Toys for every age",
    short_name: "ToyStore",
    description: "Shop toys by age, brand and category — plus a mini-games arcade for kids.",
    start_url: "/?source=pwa",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#3366ff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My Orders", url: "/orders" },
      { name: "Games Arcade", url: "/games" },
      { name: "Cart", url: "/cart" },
    ],
  };
}
