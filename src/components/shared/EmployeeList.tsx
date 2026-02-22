"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createEmployee, updateEmployee, deleteEmployee } from "@/app/actions/admin-employees";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type EmployeeRow = {
  id: string;
  name: string;
  username: string;
  role: string;
  wageRate: number;
  createdAt: Date;
};

export function EmployeeList({ employees, searchQuery }: { employees: EmployeeRow[]; searchQuery?: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<EmployeeRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<EmployeeRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const res = await createEmployee(null, new FormData(form));
    setPending(false);
    if (res.success) {
      setCreateOpen(false);
      form.reset();
      window.location.reload();
    } else setError(res.error);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editUser) return;
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const res = await updateEmployee(editUser.id, null, new FormData(form));
    setPending(false);
    if (res.success) {
      setEditUser(null);
      window.location.reload();
    } else setError(res.error);
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setError(null);
    setPending(true);
    const res = await deleteEmployee(deleteUser.id);
    setPending(false);
    if (res.success) {
      setDeleteUser(null);
      window.location.reload();
    } else setError(res.error);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Manage wages and roles. Search by name or username.</CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form method="get" className="mb-4 flex gap-2 flex-wrap items-center">
            <Input
              name="q"
              type="search"
              placeholder="Search by name or username…"
              defaultValue={searchQuery ?? ""}
              className="max-w-sm"
            />
            <Button type="submit" variant="secondary" className="mt-2">
              Search
            </Button>
          </form>
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees match your search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Name</th>
                    <th className="p-2 text-left font-medium">Username</th>
                    <th className="p-2 text-left font-medium">Role</th>
                    <th className="p-2 text-right font-medium">Wage</th>
                    <th className="p-2 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-2">{emp.name}</td>
                      <td className="p-2">{emp.username}</td>
                      <td className="p-2">{emp.role}</td>
                      <td className="p-2 text-right">{emp.wageRate.toFixed(2)}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditUser(emp); setError(null); }}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => { setDeleteUser(emp); setError(null); }}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      {createOpen && (
        <>
          <DialogOverlay onClick={() => setCreateOpen(false)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add employee</DialogTitle>
              <DialogDescription>Create a new user. They can sign in with username and password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" required placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input name="username" required placeholder="username" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input name="password" type="password" required minLength={6} placeholder="Min 6 characters" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Wage rate</label>
                <Input name="wageRate" type="number" step="0.01" min="0" required defaultValue="0" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <><Spinner className="mr-2 h-4 w-4" />Creating…</> : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </>
      )}

      {/* Edit modal */}
      {editUser && (
        <>
          <DialogOverlay onClick={() => setEditUser(null)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit employee</DialogTitle>
              <DialogDescription>Leave password blank to keep current password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <input type="hidden" name="userId" value={editUser.id} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" required defaultValue={editUser.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input name="username" required defaultValue={editUser.username} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New password (optional)</label>
                <Input name="password" type="password" minLength={6} placeholder="Leave blank to keep current" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={editUser.role}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Wage rate</label>
                <Input name="wageRate" type="number" step="0.01" min="0" required defaultValue={editUser.wageRate} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <><Spinner className="mr-2 h-4 w-4" />Saving…</> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </>
      )}

      {/* Delete confirm */}
      {deleteUser && (
        <>
          <DialogOverlay onClick={() => setDeleteUser(null)} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete employee</DialogTitle>
              <DialogDescription>
                Delete {deleteUser.name} ({deleteUser.username})? This will also remove all their timesheet entries. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
                {pending ? <><Spinner className="mr-2 h-4 w-4" />Deleting…</> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </>
      )}
    </>
  );
}
