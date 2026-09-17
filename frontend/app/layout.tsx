import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DishWise | Project preview",
  description: "A preview of DishWise, a planned Carmel, Indiana dish recommendation app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
