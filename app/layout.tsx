import Footer from "@/components/navigation/Footer";
import Header from "@/components/navigation/Header";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`flex min-h-screen w-full touch-auto flex-col overflow-y-auto antialiased ${roboto.className}`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <div className="h-[200vh]" />
        <Footer />
      </body>
    </html>
  );
}
