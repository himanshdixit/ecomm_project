"use client";

import { MotionConfig } from "framer-motion";
import { Provider } from "react-redux";

import { AuthProvider } from "@/context/AuthContext";
import CommerceBootstrap from "@/providers/CommerceBootstrap";
import { store } from "@/store";

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
        <AuthProvider>
          <CommerceBootstrap />
          {children}
        </AuthProvider>
      </MotionConfig>
    </Provider>
  );
}
