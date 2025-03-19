import React from "react";
import * as RTL from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "../helpers/auth";
import { Toaster } from "../components/ui/Toast";
import { ToastProvider } from "../components/ui/Toast";

type RenderReturnType = RTL.RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const render = (
  ui: React.ReactElement,
  options?: RTL.RenderOptions,
): RenderReturnType => {
  const user = userEvent.setup();

  return {
    ...RTL.render(ui, {
      wrapper: ({ ...props }) => (
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>{props.children}</AuthProvider>
              <Toaster />
            </BrowserRouter>
          </QueryClientProvider>
        </ToastProvider>
      ),
      ...options,
    }),
    user,
  };
};

// re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";

// override render method
export { render };
