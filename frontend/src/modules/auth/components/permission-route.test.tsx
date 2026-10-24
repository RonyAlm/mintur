import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";

import { AuthContext, type AuthContextType } from "@/modules/auth/context/authContext";
import { PermissionRoute } from "@/modules/auth/components/permission-route";

const user = {
  id: "user-1",
  email: "admin@example.com",
  username: "admin",
  firstName: "Admin",
  lastName: "User",
  role: { id: "role-1", name: "Admin", description: null },
  permissions: ["users:read"],
  mustChangePassword: false,
};

function renderRoute(auth: Partial<AuthContextType>) {
  const value = {
    user: null,
    login: async () => false,
    logout: async () => {},
    loading: false,
    error: null,
    updateUser: () => {},
    ...auth,
  } satisfies AuthContextType;

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/users"]}>
        <Routes>
          <Route element={<PermissionRoute permission="users:read" />}>
            <Route path="/users" element={<h1>Users page</h1>} />
          </Route>
          <Route path="/403" element={<h1>Access denied</h1>} />
          <Route path="/auth/login" element={<h1>Sign in</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("PermissionRoute", () => {
  it("renders the route when the user has the required permission", () => {
    renderRoute({ user });

    expect(screen.getByRole("heading", { name: "Users page" })).toBeInTheDocument();
  });

  it("redirects users without the required permission to the forbidden page", () => {
    renderRoute({ user: { ...user, permissions: [] } });

    expect(screen.getByRole("heading", { name: "Access denied" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users to sign in", () => {
    renderRoute({ user: null });

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
