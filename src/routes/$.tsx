import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import App from "@/App";

export const Route = createFileRoute("/$")({
  ssr: false,
  component: AppPage,
});

function AppPage() {
  return (
    <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading…</div>}>
      <App />
    </ClientOnly>
  );
}
