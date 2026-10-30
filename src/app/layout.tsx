import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parakeet AI — Local Desktop Copilot & Meeting Assistant",
  description: "Small desktop prototype inspired by Parakeet AI with on-device speech capture and progressive streaming local LLM answer generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
