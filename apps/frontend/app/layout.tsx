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
        {/* Prevent dark mode flash — apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
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
