import React from "react";
import { UserButton } from "@clerk/nextjs";

type Props = {};

const Unauthorized = (props: Props) => {
  return (
    <div className="p-4 text-center h-screen w-full flex flex-col items-center justify-center bg-background">
      <h1 className="text-3xl md:text-6xl font-bold mb-4">Unauthorized Access</h1>
      <p className="text-muted-foreground text-md md:text-xl max-w-lg">
        Please contact your agency owner for this.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
        <span className="text-sm text-muted-foreground italic">Sign out to try another account</span>
      </div>
    </div>
  );
};

export default Unauthorized;