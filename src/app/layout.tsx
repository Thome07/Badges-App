import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GC Java | Badges System",
  description: "Plataforma de reconhecimento técnico.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      {/* O comentário foi removido daqui para evitar o erro de hidratação */}
      <body className={`${inter.variable} ${jetbrains.variable} antialiased bg-background text-foreground min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <Navbar />
        <main className="min-h-screen relative">
           {/* Grid de fundo sutil */}
           <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}