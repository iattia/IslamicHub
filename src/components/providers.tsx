"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { ContentLanguageProvider } from "@/components/content-language-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "beige"]}
    >
      <QueryClientProvider client={queryClient}>
        <ContentLanguageProvider>{children}</ContentLanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
