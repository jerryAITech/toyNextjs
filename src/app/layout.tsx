import type { Metadata, Viewport } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import { Providers } from "@/context/Providers";
import { ServiceWorkerRegistration } from "@/components/site/ServiceWorkerRegistration";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ToyStore — Play. Learn. Grow.",
    template: "%s | ToyStore",
  },
  description:
    "ToyStore is a premium destination for toys parents trust — educational toys, action figures, dolls, building blocks and more, with fast delivery across India.",
  openGraph: {
    siteName: "ToyStore",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ToyStore",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3366ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ServiceWorkerRegistration />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
