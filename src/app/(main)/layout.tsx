import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";
import ModalProvider from "@/hooks/use-modal";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ModalProvider>{children}</ModalProvider>
    </ClerkProvider>
  );
};

export default Layout;
