"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import { Task, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiCall } from "@/lib/api";
import { DownloadCloud, Trash } from "lucide-react";
import { handleDownload } from "@/lib/utils";
import { generators } from "@/config/app";
import { Generator } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import toast from "react-hot-toast";

type TaskWithUser = Task & { user: User };

export default function TasksTable({ isAdmin = true }: { isAdmin?: boolean }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [tasksData, setTasksData] = useState<{
    tasks: TaskWithUser[];
    pageCount: number;
  } | null>(null);

  const fetchDataOptions = {
    pageIndex,
    pageSize,
    isAdmin,
  };

  const { isLoading, isError, refetch } = useTaskData(
    fetchDataOptions,
    setTasksData,
  );

  const defaultData = useMemo(() => [], []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`/api/tasks/${deletingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
        // Remove the deleted task from the existing data
        setTasksData((prevData) => {
          if (!prevData) return null;
          return {
            ...prevData,
            tasks: prevData.tasks.filter((task) => task.id !== deletingId),
          };
        });
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, [deletingId]);

  const columns = useMemo<ColumnDef<TaskWithUser>[]>(
    () => [
      ...(isAdmin
        ? [
            {
              accessorKey: "user",
              header: "User",
              cell: ({ row }: { row: any }) => row.original.user.name,
            },
          ]
        : []),

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "COMPLETED"
                ? "success"
                : row.original.status === "FAILED"
                  ? "destructive"
                  : "default"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "progress",
        header: "Processed",
        cell: ({ row }) => `${row.original.progress}`,
      },
      {
        accessorKey: "totalFiles",
        header: "Total Files",
      },
      {
        accessorKey: "generator",
        header: "Generator",
      },
      {
        accessorKey: "creditsUsed",
        header: "Credits",
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        accessorKey: "status",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                size={"icon"}
                disabled={row.original.status !== "COMPLETED"}
                onClick={() => {
                  if (row.original.result) {
                    const metadata = Array.isArray(row.original.result)
                      ? row.original.result.map((file: any) => file.metadata)
                      : [];
                    const generatorTitle = row.original.generator;
                    const generator = generators.find(
                      (g) => g.title === generatorTitle,
                    );

                    handleDownload({
                      metadata,
                      generator: generator as Generator,
                    });
                  }
                }}
              >
                <DownloadCloud size={16} />
              </Button>
              {isAdmin && (
                <Button
                  size={"icon"}
                  variant={"destructive"}
                  onClick={() => handleDelete(row.original.id)}
                >
                  <Trash size={16} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: tasksData?.tasks ?? defaultData,
    columns,
    pageCount: tasksData?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading tasks</div>;
  }

  return (
    <div className="space-y-4">
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
      <div className="flex items-center justify-between">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
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
    </div>
  );
}

function useTaskData(
  options: {
    pageIndex: number;
    pageSize: number;
    isAdmin: boolean;
  },
  setTasksData: React.Dispatch<
    React.SetStateAction<{
      tasks: TaskWithUser[];
      pageCount: number;
    } | null>
  >,
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await apiCall(
        "GET",
        `/api/tasks?page=${options.pageIndex + 1}&limit=${options.pageSize}&isAdmin=${options.isAdmin}`,
      );
      if (!response.success) {
        throw new Error("Failed to fetch tasks");
      }
      setTasksData(response);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [options.pageIndex, options.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { isLoading, isError, refetch: fetchData };
}
