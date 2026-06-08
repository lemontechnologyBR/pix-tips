import { BackToTop } from "@/components/landing/BackToTop";
import { CookieConsent } from "@/components/landing/CookieConsent";
import { CTASection } from "@/components/landing/CTASection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Navbar } from "@/components/landing/Navbar";
import { PreviewSection } from "@/components/landing/PreviewSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "pix.tips — Plataforma de doação para streamers | Pix e alertas",
  description:
    "Receba doações dos seus fãs com Pix e veja na sua live em tempo real. Crie sua página grátis, alertas personalizados no OBS e comissão justa.",
  keywords: [
    "doação streamer",
    "tip page",
    "pix live",
    "alertas obs",
    "monetizar conteúdo",
  ],
  openGraph: {
    title: "pix.tips — Doações com Pix e alertas em tempo real",
    description:
      "Plataforma brasileira para criadores receberem doações via Pix com alertas na live.",
    type: "website",
    url: "https://pix.tips",
    locale: "pt_BR",
    siteName: "pix.tips",
  },
  twitter: {
    card: "summary_large_image",
    title: "pix.tips — Doações para criadores",
    description: "Pix integrado, alertas no OBS, grátis para começar.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pix.tips",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  description:
    "Plataforma de doações para criadores de conteúdo com Pix, alertas em tempo real e widget OBS.",
  inLanguage: "pt-BR",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="relative">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PreviewSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <CookieConsent />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}
