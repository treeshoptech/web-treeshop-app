import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopOS - Field Operations Platform",
  description: "Project management and operations platform for field service businesses",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ShopOS",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#007AFF',
          colorBackground: '#000000',
          colorText: '#FFFFFF',
          colorInputBackground: '#1A1A1A',
          colorInputText: '#FFFFFF',
        },
        elements: {
          formButtonPrimary: 'bg-[#007AFF] hover:bg-[#0066DD]',
          card: 'bg-[#1A1A1A] border border-[#2A2A2A]',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-[#1A1A1A] border-[#2A2A2A] text-white hover:bg-[#0A0A0A]',
          formFieldLabel: 'text-gray-400',
          formFieldInput: 'bg-[#1A1A1A] border-[#2A2A2A] text-white',
          footerActionLink: 'text-[#007AFF] hover:text-[#0066DD]',
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
