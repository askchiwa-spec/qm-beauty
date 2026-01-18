import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import Cart from "@/components/cart/Cart";
import { CartProvider } from "@/lib/cartContext";

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-serif",
});

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "QM Beauty - Natural & Organic Cosmetics | Spa Services in Dar es Salaam",
  description: "QM Beauty offers natural, organic skincare and haircare products for all skin types. Visit our luxury spa in Upanga, Dar es Salaam for premium beauty treatments.",
  keywords: "QM Beauty, organic cosmetics, natural skincare, spa Dar es Salaam, beauty products Tanzania, organic haircare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${montserrat.variable} antialiased`}
      >
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Cart />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
