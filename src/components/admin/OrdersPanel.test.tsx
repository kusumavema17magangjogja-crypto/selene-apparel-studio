import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OrdersPanel } from "./Panels";

const mocks = vi.hoisted(() => ({ insert: vi.fn(), update: vi.fn(), eq: vi.fn(), orders: [] as object[] }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: (table: string) => ({
  select: () => { const response = { data: table === "products" ? [{ id: "master-1", name: "Kaos Combed" }, { id: "master-2", name: "Polo Shirt" }] : mocks.orders, error: null }; const query = { order: () => query, then: (resolve: (v: typeof response) => unknown) => Promise.resolve(response).then(resolve) }; return query; },
  insert: mocks.insert,
  update: mocks.update,
}) } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
beforeEach(() => { vi.clearAllMocks(); mocks.orders = []; mocks.insert.mockResolvedValue({ error: null }); mocks.eq.mockResolvedValue({ error: null }); mocks.update.mockReturnValue({ eq: mocks.eq }); });
afterEach(cleanup);

async function startOrder() {
  render(<OrdersPanel />);
  fireEvent.click(screen.getByRole("button", { name: "Tambah" }));
  await screen.findByRole("combobox", { name: "Produk" });
  fireEvent.change(screen.getByPlaceholderText("Nama pemesan"), { target: { value: "Pelanggan Test" } });
}
it("saves the name selected from dynamic master products, not its id", async () => {
  await startOrder();
  fireEvent.change(screen.getByRole("combobox", { name: "Produk" }), { target: { value: "master-1" } });
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
  await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ product: "Kaos Combed" })));
});
it("saves a manual product through Lainnya / Kustom", async () => {
  await startOrder();
  fireEvent.change(screen.getByRole("combobox", { name: "Produk" }), { target: { value: "__custom__" } });
  fireEvent.change(screen.getByLabelText("Nama produk kustom"), { target: { value: "Seragam Kustom" } });
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
  await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ product: "Seragam Kustom" })));
});
it("preserves an existing custom product when editing and saves the new catalog choice", async () => {
  mocks.orders = [{ id: "order-1", customer_name: "Pelanggan Test", product: "Hoodie Kustom", phone: "08123", quantity: 24, notes: "", status: "pending", created_at: "2026-10-17" }];
  render(<OrdersPanel />);
  fireEvent.click(await screen.findByRole("button", { name: "Edit pesanan Pelanggan Test" }));
  expect(await screen.findByLabelText("Nama produk kustom")).toHaveValue("Hoodie Kustom");
  fireEvent.change(screen.getByRole("combobox", { name: "Produk" }), { target: { value: "master-2" } });
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
  await waitFor(() => expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ product: "Polo Shirt", status: "pending" })));
  expect(mocks.eq).toHaveBeenCalledWith("id", "order-1");
});