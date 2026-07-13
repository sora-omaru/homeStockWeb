import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Home Stock",
  description: "おうちの在庫を、かんたん・きれいに管理。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
