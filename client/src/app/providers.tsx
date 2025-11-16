"use client";
import StoreProvider from "@/state/redux";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return  (
    <StoreProvider>
        <AuthProvider>
            {children}
            <Toaster 
              position="top-right" 
              theme="dark"
              richColors
            />
        </AuthProvider>
    </StoreProvider>
    )
}
