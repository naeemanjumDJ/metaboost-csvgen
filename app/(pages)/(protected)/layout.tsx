import Loader from "@/components/Loader";
import Providers from "@/components/Providers";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <Loader>{children}</Loader>
    </Providers>
  );
};

export default layout;
