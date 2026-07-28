import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/referenciak")({
  component: ReferencesLayout,
});

function ReferencesLayout() {
  return <Outlet />;
}
