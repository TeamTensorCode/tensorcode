import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/edit/$id")({
  component: () => <Navigate to="/admin" replace />,
});
