import type { Metadata } from "next";
import "./globals.css";
import { ThemeLanguageProvider } from "@/context/ThemeLanguageContext";

export const metadata: Metadata = {
  title: "Irma Iryani - Portfolio",
  description:
    "Portfolio Irma Iryani - S1 Pendidikan Kimia Universitas Sriwijaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Scroll to top on every page load/refresh before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body>
        <ThemeLanguageProvider>{children}</ThemeLanguageProvider>
      </body>
    </html>
  );
}
