import React from "react";
import TransactionsTable from "@/components/admin/TransactionsTable";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Transactions</h1>
      <TransactionsTable />
    </div>
  );
}
