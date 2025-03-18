import "./globals.css";

export const metadata = {
  title: "Room Builder ThreeJS maxverwiebe",
  description: "Room Builder ThreeJS maxverwiebe",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>{children}</body>
    </html>
  );
}
