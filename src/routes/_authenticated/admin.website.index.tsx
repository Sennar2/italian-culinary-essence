import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/website/")({
  component: () => <Navigate to="/admin/website/hero" replace />,
});