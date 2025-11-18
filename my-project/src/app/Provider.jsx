import * as React from "react";
import { Toaster } from "sonner";

export default function Provider({ children }) {
  return (
    <>
      <Toaster position="top-center" richColors />
      {children}
    </>
  );
}
