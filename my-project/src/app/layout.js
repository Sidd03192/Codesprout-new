import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { ToastProvider } from "@heroui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Code Sprout",

  description: "The new platform for classroom-based coding education",
};
const theme = {
  components: {
    Button: {
      defaultProps: {
        radius: "sm",
      },
    },
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="dark text-foreground bg-background w-screen overflow-hidden  ">
        <Provider theme={theme}>{children}</Provider>
      </body>
    </html>
  );
}
