import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SaberCuidar — Gerenciamento Home Care",
    template: "%s | SaberCuidar",
  },
  description:
    "Sistema de gerenciamento para Home Care: fichas médicas, visitas domiciliares, administração medicamentosa e gestão de profissionais de saúde.",
  keywords: [
    "home care",
    "cuidados domiciliares",
    "prontuário eletrônico",
    "saúde domiciliar",
    "gestão médica",
    "enfermagem domiciliar",
  ],
  authors: [{ name: "SaberCuidar" }],
  robots: "noindex, nofollow", // Sistema privado
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
