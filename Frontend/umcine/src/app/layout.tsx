import type { Metadata } from "next";
import localFont from "next/font/local";
import Footer from "../components/footer";
import Header from "../components/header";
import Providers from "../components/providers";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: {
    default: "UMCine",
    template: "%s | UMCine",
  },
  description: "인기 영화를 둘러보고 평점과 즐겨찾기로 나만의 영화 기록을 남겨요.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "UMCine",
    description: "인기 영화를 둘러보고 평점과 즐겨찾기로 나만의 영화 기록을 남겨요.",
    siteName: "UMCine",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
