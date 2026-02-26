import "@aws-amplify/ui-react/styles.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão de Obras",
  description: "Sistema fullstack real com AWS Amplify Gen 2"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
