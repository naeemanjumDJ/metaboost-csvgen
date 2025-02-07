import React from "react";
import { Button } from "./ui/button";
import { Google } from "./icons";
import { signIn } from "@/auth";

const GoogleLoginButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button
        variant={"secondary"}
        size={"lg"}
        className="mt-8 text-sm"
        type="submit"
      >
        <Google size={20} />
        Login with Google
      </Button>
    </form>
  );
};

export default GoogleLoginButton;
