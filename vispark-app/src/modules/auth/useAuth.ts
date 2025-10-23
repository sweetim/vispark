import { useContext } from "react";
import type { AuthContextValue } from "./AuthProvider";

import { AuthContext } from "./AuthProvider";

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
