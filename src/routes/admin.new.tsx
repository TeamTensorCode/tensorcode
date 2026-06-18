import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/new")({
  component: () => <Navigate to="/admin" replace />,
});
