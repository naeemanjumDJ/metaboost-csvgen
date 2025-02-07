import CreateForm from "@/components/app/CreateForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const page = () => {
  return (
    <>
      <h1 className="text-5xl font-semibold">Generate CSV</h1>

      <CreateForm />
    </>
  );
};

export default page;
