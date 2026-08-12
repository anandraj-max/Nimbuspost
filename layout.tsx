import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../../public/fonts/Inter_400Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Inter_500Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Inter_600SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Inter_700Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "NimbusPost · Internal Tools",
  description:
    "Create branded NimbusPost job descriptions and download them as PDF or Word.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
