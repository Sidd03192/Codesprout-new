import "./globals.css";
import Provider from "./Provider";

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
