import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { LanguageSelector } from "@/components/language-selector";
import { HowToPlayDialog } from "@/components/how-to-play-dialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Knight's Tour - Interactive Chess Puzzle",
    template: "%s | Knight's Tour",
  },
  description:
    "Interactive Knight's Tour puzzle game. Move the knight to visit every square exactly once on a customizable chessboard.",
  keywords: [
    "Knight's Tour",
    "Chess Puzzle",
    "Interactive Chess",
    "Knight Move Puzzle",
    "Chess Game",
    "Mathematical Puzzle",
    "Chess Challenge",
  ],
  authors: [{ name: "Knight's Tour" }],
  alternates: {
    languages: {
      "en-US": "/en-US",
      "es-ES": "/es-ES",
      "fr-FR": "/fr-FR",
      "de-DE": "/de-DE",
      "ja-JP": "/ja-JP",
      "zh-CN": "/zh-CN",
      "ko-KR": "/ko-KR",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES", "fr_FR", "de_DE", "ja_JP", "zh_CN", "ko_KR"],
    url: "https://knights-tour.com",
    siteName: "Knight's Tour Puzzle",
    title: "Knight's Tour - Interactive Chess Puzzle",
    description:
      "Interactive Knight's Tour puzzle game. Move the knight to visit every square exactly once on a customizable chessboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Knight's Tour Puzzle Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Knight's Tour - Interactive Chess Puzzle",
    description:
      "Interactive Knight's Tour puzzle game. Move the knight to visit every square exactly once on a customizable chessboard.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "dc.title": "Knight's Tour - Interactive Chess Puzzle",
    "dc.description":
      "Interactive Knight's Tour puzzle game. Move the knight to visit every square exactly once on a customizable chessboard.",
    "dc.language": "en-US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          hrefLang="en-US"
          href="https://knights-tour.com/en-US"
        />
        <link
          rel="alternate"
          hrefLang="es-ES"
          href="https://knights-tour.com/es-ES"
        />
        <link
          rel="alternate"
          hrefLang="fr-FR"
          href="https://knights-tour.com/fr-FR"
        />
        <link
          rel="alternate"
          hrefLang="de-DE"
          href="https://knights-tour.com/de-DE"
        />
        <link
          rel="alternate"
          hrefLang="ja-JP"
          href="https://knights-tour.com/ja-JP"
        />
        <link
          rel="alternate"
          hrefLang="zh-CN"
          href="https://knights-tour.com/zh-CN"
        />
        <link
          rel="alternate"
          hrefLang="ko-KR"
          href="https://knights-tour.com/ko-KR"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://knights-tour.com"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <ThemeToggle />
            <LanguageSelector />
            <HowToPlayDialog />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
