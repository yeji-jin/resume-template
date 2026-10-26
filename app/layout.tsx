import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const notoSansKR = localFont({
  src: [
    {
      path: "../public/fonts/ResumeSansKR-Regular.ttf",
      weight: "400 600",
    },
    {
      path: "../public/fonts/ResumeSansKR-Bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "이력서 작성", template: "%s | 이력서 작성" },
  description: "간편하게 이력서를 작성하고 PDF로 내보내세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
