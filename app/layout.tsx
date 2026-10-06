import { Amita, DM_Sans, Inter_Tight, Manrope, Poppins } from "next/font/google";
import Header from "@/components/sections/Header";
import "./globals.css";

// Fonts from the live Elementor kit. Names map to tokens in globals.css (@theme).
const manrope = Manrope({ variable: "--nf-manrope", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--nf-dm-sans", subsets: ["latin"] });
const interTight = Inter_Tight({ variable: "--nf-inter-tight", subsets: ["latin"] });
const amita = Amita({ variable: "--nf-amita", subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ variable: "--nf-poppins", subsets: ["latin"], weight: "500" });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-US"
      className={`${manrope.variable} ${dmSans.variable} ${interTight.variable} ${amita.variable} ${poppins.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2 focus:text-navy">
          Skip to content
        </a>
        <Header />
        <div id="content" className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
