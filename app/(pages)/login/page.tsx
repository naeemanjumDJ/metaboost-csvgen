import GoogleLoginButton from "@/components/GoogleLoginButton";
import React from "react";

const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-10 bg-white rounded-2xl text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Login to get started
        </p>
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default page;
