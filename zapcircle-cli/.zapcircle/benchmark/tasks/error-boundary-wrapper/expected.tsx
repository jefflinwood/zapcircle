import { ErrorBoundary } from "./ErrorBoundary";

export function AppContent() {
  return (
    <ErrorBoundary>
      <main>Main content goes here</main>
    </ErrorBoundary>
  );
}