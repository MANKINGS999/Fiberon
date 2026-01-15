import React from "react";

/**
 * InstrumentationProvider - Disabled
 * Previously contained Vly error monitoring which was causing
 * "Runtime Error" dialogs on deployment.
 * 
 * Now simply passes through children without any monitoring.
 */
export function InstrumentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
