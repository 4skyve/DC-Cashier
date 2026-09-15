import "./globals.css";
import { Hanken_Grotesk } from "next/font/google";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${hanken.variable} font-sans bg-neutral-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
