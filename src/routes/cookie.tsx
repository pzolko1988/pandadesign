import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cookie")({
  beforeLoad: () => {
    throw redirect({ href: "/cookie-tajekoztato", statusCode: 301 });
  },
});
