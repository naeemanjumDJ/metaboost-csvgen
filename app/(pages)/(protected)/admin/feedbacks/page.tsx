"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import { Feedback, FeedbackStatus, FeedbackType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiCall } from "@/lib/api";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

type FeedbackWithUser = Feedback & { user: { name: string } };

export default function FeedbacksPage() {
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-semibold text-gray-800">Feedbacks</h1>
      <FeedbacksTable />
    </div>
  );
}

function FeedbacksTable() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  };

  const { data, isLoading, isError, refetch } =
    useFeedbackData(fetchDataOptions);

  const defaultData = useMemo(() => [], []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const columns = useMemo<ColumnDef<FeedbackWithUser>[]>(
    () => [
      {
        accessorKey: "user.name",
        header: "User Name",
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "types",
        header: "Types",
        cell: ({ row }) => row.original.types.join(", "),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusSelect
            value={row.original.status}
            onStatusChange={(newStatus) =>
              handleStatusChange(row.original.id, newStatus)
            }
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DeleteFeedbackButton
            feedbackId={row.original.id}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data?.feedbacks ?? defaultData,
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const handleStatusChange = async (
    feedbackId: string,
    newStatus: FeedbackStatus,
  ) => {
    // Implement the API call to update the status
    // After successful update, refetch the data
    await updateFeedbackStatus(feedbackId, newStatus);
    refetch();
  };

  const handleDelete = async (feedbackId: string) => {
    // Implement the API call to delete the feedback
    // After successful deletion, refetch the data
    await deleteFeedback(feedbackId);
    refetch();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading feedbacks</div>;
  }

  return (
    <div className="space-y-4">
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
    </div>
  );
}

function StatusSelect({
  value,
  onStatusChange,
}: {
  value: FeedbackStatus;
  onStatusChange: (status: FeedbackStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(FeedbackStatus).map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DeleteFeedbackButton({
  feedbackId,
  onDelete,
}: {
  feedbackId: string;
  onDelete: (id: string) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={"icon"}>
          <Trash size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            feedback.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(feedbackId)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function useFeedbackData(options: { pageIndex: number; pageSize: number }) {
  const [data, setData] = useState<{
    feedbacks: FeedbackWithUser[];
    pageCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(
        `/api/feedbacks?page=${options.pageIndex + 1}&limit=${options.pageSize}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [options.pageIndex, options.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refetch: fetchData };
}

async function updateFeedbackStatus(
  feedbackId: string,
  newStatus: FeedbackStatus,
) {
  // Implement the API call to update the feedback status
  const data = await apiCall("PATCH", `/api/feedbacks/${feedbackId}`, {
    status: newStatus,
  });

  if (data.success) {
    toast.success("Feedback updated successfully");
  }
}

async function deleteFeedback(feedbackId: string) {
  // Implement the API call to delete the feedback
  const data = await apiCall("DELETE", `/api/feedbacks/${feedbackId}`);

  if (data.success) {
    toast.success("Feedback deleted successfully");
  }
}
