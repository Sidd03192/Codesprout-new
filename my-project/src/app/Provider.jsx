import * as React from "react";

// 1. import `HeroUIProvider` component
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
export default function Provider({ children }) {
  // 2. Wrap HeroUIProvider at the root of your app
  return (
    <HeroUIProvider>
      <ToastProvider placement={"top-center"} />
      {children}
    </HeroUIProvider>
  );
}
