import { Amita, Archivo, DM_Sans, Inter, Inter_Tight, Lato, Manrope, Nunito_Sans, Poppins } from "next/font/google";
import Header from "@/components/sections/Header";
import "./globals.css";

// Fonts from the live Elementor kit. Names map to tokens in globals.css (@theme).
const manrope = Manrope({ variable: "--nf-manrope", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--nf-dm-sans", subsets: ["latin"] });
const interTight = Inter_Tight({ variable: "--nf-inter-tight", subsets: ["latin"] });
const amita = Amita({ variable: "--nf-amita", subsets: ["latin"], weight: ["400", "700"] });
// Used on a few sections/pages only: not preloaded everywhere.
const poppins = Poppins({ variable: "--nf-poppins", subsets: ["latin"], weight: "500", preload: false });
const lato = Lato({ variable: "--nf-lato", subsets: ["latin"], weight: ["400", "700"], preload: false });
const nunito = Nunito_Sans({ variable: "--nf-nunito", subsets: ["latin"], preload: false });
const inter = Inter({ variable: "--nf-inter", subsets: ["latin"], preload: false });
const archivo = Archivo({ variable: "--nf-archivo", subsets: ["latin"], preload: false });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-US"
      className={`${manrope.variable} ${dmSans.variable} ${interTight.variable} ${amita.variable} ${poppins.variable} ${lato.variable} ${nunito.variable} ${inter.variable} ${archivo.variable} antialiased`}
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
