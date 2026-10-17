import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccountPanel } from "./AccountPanel";

const mocks = vi.hoisted(() => ({ updateUser: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { updateUser: mocks.updateUser } } }));
vi.mock("sonner", () => ({ toast: { success: mocks.success, error: mocks.error } }));
beforeEach(() => { vi.clearAllMocks(); });
afterEach(cleanup);

describe("Account changes", () => {
  it("sends the new password with the current password and clears secrets on success", async () => {
    mocks.updateUser.mockResolvedValue({ error: null });
    render(<AccountPanel email="admin@example.test" />);
    fireEvent.change(screen.getByLabelText("Password Saat Ini"), { target: { value: "old-test-password" } });
    fireEvent.change(screen.getByLabelText("Password Baru"), { target: { value: "new-test-password" } });
    fireEvent.change(screen.getByLabelText("Konfirmasi Password Baru"), { target: { value: "new-test-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Password Baru" }));
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: "new-test-password", current_password: "old-test-password" }));
    await waitFor(() => expect(screen.getByLabelText("Password Saat Ini")).toHaveValue(""));
  });

  it("blocks mismatched password confirmation", () => {
    render(<AccountPanel email="admin@example.test" />);
    fireEvent.change(screen.getByLabelText("Password Saat Ini"), { target: { value: "old-test-password" } });
    fireEvent.change(screen.getByLabelText("Password Baru"), { target: { value: "new-test-password" } });
    fireEvent.change(screen.getByLabelText("Konfirmasi Password Baru"), { target: { value: "different-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Password Baru" }));
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalled();
  });

  it("sends email changes and preserves active email until confirmation", async () => {
    mocks.updateUser.mockResolvedValue({ data: { user: { email: "admin@example.test" } }, error: null });
    render(<AccountPanel email="admin@example.test" />);
    fireEvent.change(screen.getByLabelText("Email Baru"), { target: { value: "new@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Perbarui Email" }));
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ email: "new@example.test" }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(screen.getByLabelText("Email aktif")).toHaveValue("admin@example.test");
  });

  it("keeps entered values and reenables saving after a failed request", async () => {
    mocks.updateUser.mockRejectedValue(new Error("offline"));
    render(<AccountPanel email="admin@example.test" />);
    fireEvent.change(screen.getByLabelText("Email Baru"), { target: { value: "new@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Perbarui Email" }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(screen.getByLabelText("Email Baru")).toHaveValue("new@example.test");
    expect(screen.getByRole("button", { name: "Perbarui Email" })).toBeEnabled();
  });
});