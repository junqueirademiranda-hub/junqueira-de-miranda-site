import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Junqueira de Miranda Advocacia",
  description:
    "Advocacia estratégica e personalizada nas áreas cível, família, imobiliária e consultoria preventiva.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/images/logo-oficial-junqueira-de-miranda.png",
    shortcut: "/images/logo-oficial-junqueira-de-miranda.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-39N6Z3SMD7"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);};
              window.gtag('js', new Date());
              window.gtag('config', 'G-39N6Z3SMD7');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
