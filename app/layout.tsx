import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PwaServiceWorker from "./components/pwa-service-worker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdminNoApp",
  description: "Painel de admin do Pedidonoapp",
  applicationName: "AdminNoApp",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AdminNoApp",
  },
  icons: {
    apple: "/icons/icon-adminnoapp-192.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaServiceWorker />
      </body>
    </html>
  );
}
