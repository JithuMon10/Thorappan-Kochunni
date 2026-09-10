import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "thorappankochunni",
  description: "Secure personal file and note transfer system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
