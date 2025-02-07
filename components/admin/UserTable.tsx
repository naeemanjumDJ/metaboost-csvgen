"use client";

import React, { useCallback, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import { User, Role, Transaction } from "@prisma/client";
import { CreditCard, Edit2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiCall } from "@/lib/api";
import { useDebounce } from "use-debounce";

type UserWithCredits = User & { credits: { balance: number } | null };

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const colorMap: Record<Role, string> = {
    USER: "bg-blue-100 text-blue-800",
    ADMIN: "bg-green-100 text-green-800",
    SUPERADMIN: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${colorMap[role]}`}
    >
      {role}
    </span>
  );
};

const transactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["PKR", "USD"]),
  creditAmount: z.number().int().positive(),
  paymentMethod: z.string().min(1),
});

export default function UserTable() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [editingUser, setEditingUser] = useState<UserWithCredits | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingCredits, setEditingCredits] = useState<{
    userId: string;
    balance: number;
  } | null>(null);
  const [newTransaction, setNewTransaction] = useState<
    Partial<Transaction & { creditAmount: number }>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);
  const [editingRole, setEditingRole] = useState<{
    userId: string;
    role: Role;
  } | null>(null);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const fetchDataOptions = {
    pageIndex,
    pageSize,
    searchTerm: debouncedSearchTerm,
  };

  const { data, isLoading, isError, refetch } = useUserData(fetchDataOptions);

  const defaultData = React.useMemo(() => [], []);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const handleEdit = useCallback((user: UserWithCredits) => {
    setEditingUser(user);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeletingUserId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingUserId) return;

    try {
      const response = await fetch(`/api/users/${deletingUserId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        refetch();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setDeletingUserId(null);
    }
  }, [deletingUserId, toast, refetch]);

  const confirmEdit = useCallback(
    async (updatedUser: UserWithCredits) => {
      try {
        const response = await fetch(`/api/users/${updatedUser.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
          toast.success("User updated successfully");
          refetch();
        } else {
          throw new Error("Failed to update user");
        }
      } catch (error) {
        toast.error("Failed to update user. Please try again.");
      } finally {
        setEditingUser(null);
      }
    },
    [toast, refetch],
  );

  const handleEditCredits = useCallback((user: UserWithCredits) => {
    setEditingCredits({ userId: user.id, balance: user.credits?.balance || 0 });
  }, []);

  const handleTransaction = useCallback((userId: string) => {
    setNewTransaction({ userId });
  }, []);

  const confirmEditCredits = useCallback(async () => {
    if (!editingCredits) return;

    try {
      const response = await fetch(
        `/api/users/${editingCredits.userId}/credits`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ balance: editingCredits.balance }),
        },
      );

      if (response.ok) {
        toast.success("Credits updated successfully");
        refetch();
      } else {
        throw new Error("Failed to update credits");
      }
    } catch (error) {
      toast.error("Failed to update credits. Please try again.");
    } finally {
      setEditingCredits(null);
    }
  }, [editingCredits, toast, refetch]);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      currency: "PKR",
      creditAmount: 0,
      paymentMethod: "",
    },
  });

  const handleCreateTransaction = useCallback(
    async (values: z.infer<typeof transactionSchema>) => {
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, userId: newTransaction.userId }),
        });

        if (response.ok) {
          toast.success("Transaction created successfully");
          refetch();
          setNewTransaction({});
          form.reset();
        } else {
          throw new Error("Failed to create transaction");
        }
      } catch (error) {
        toast.error("Failed to create transaction. Please try again.");
      }
    },
    [newTransaction.userId, toast, refetch, form],
  );

  const handleRoleUpdate = useCallback(
    async (userId: string, newRole: Role) => {
      try {
        const response = await apiCall("PATCH", `/api/users/${userId}/role`, {
          role: newRole,
        });

        if (response.success) {
          toast.success("User role updated successfully");
          refetch();
        }
      } catch (error) {
        toast.error("Failed to update user role. Please try again.");
      } finally {
        setEditingRole(null);
      }
    },
    [refetch],
  );

  const columns: ColumnDef<UserWithCredits>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <RoleBadge role={row.original.role} />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setEditingRole({
                userId: row.original.id,
                role: row.original.role,
              })
            }
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "credits.balance",
      header: "Credits",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span>{row.original.credits?.balance || 0}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditCredits(row.original)}
          >
            <CreditCard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTransaction(row.original.id)}
          >
            <CreditCard className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.users ?? defaultData,
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Error loading users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={handleSearch}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
      </div>

      <AlertDialog
        open={!!deletingUserId}
        onOpenChange={() => setDeletingUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmEdit(editingUser);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingUser.name || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={editingUser.email || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="openai" className="text-right">
                    OpenAi Key
                  </Label>
                  <Input
                    id="openai"
                    value={editingUser.openAiApiKey || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        openAiApiKey: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gemini" className="text-right">
                    Gemini Key
                  </Label>
                  <Input
                    id="gemini"
                    value={editingUser.geminiApiKey || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        geminiApiKey: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                {/* Add more fields as needed */}
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingCredits}
        onOpenChange={() => setEditingCredits(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Credits</DialogTitle>
          </DialogHeader>
          {editingCredits && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmEditCredits();
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="credits" className="text-right">
                    Credits
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    value={editingCredits.balance}
                    onChange={(e) =>
                      setEditingCredits({
                        ...editingCredits,
                        balance: parseInt(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!newTransaction.userId}
        onOpenChange={() => {
          setNewTransaction({});
          form.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateTransaction)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PKR">PKR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Create Transaction</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRoleUpdate(editingRole.userId, editingRole.role);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={editingRole.role}
                    onValueChange={(value: Role) =>
                      setEditingRole({ ...editingRole, role: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useUserData(options: {
  pageIndex: number;
  pageSize: number;
  searchTerm: string;
}) {
  const [data, setData] = useState<{
    users: UserWithCredits[];
    pageCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(
        `/api/users?page=${options.pageIndex + 1}&limit=${options.pageSize}&search=${encodeURIComponent(options.searchTerm)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [options.pageIndex, options.pageSize, options.searchTerm]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}
