import Sidebar from "@/components/app/Sidebar";
import Feedback from "@/components/Feedback";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <div className="flex h-screen flex-1 flex-col overflow-hidden bg-white">
        <ScrollArea >
          <div className="p-5 lg:p-10">{children}</div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <Feedback />
    </div>
  );
};

export default layout;
