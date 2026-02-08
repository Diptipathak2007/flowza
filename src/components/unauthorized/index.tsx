import Link from "next/link";
import React from "react";

type Props={}

const Unauthorized = (props:Props) => {
    return (
        <div className="p-4 text-center h-screen w-full flex items-center justify-center">
            <h1 className="text-3xl md:text-6xl">Unauthorized Access</h1>
            <p className="text-md md:text-xl">You do not have permission to access this page</p>
            <Link href="/" className="mt-4 text-blue-500">Go back to home</Link>
        </div>
    );
};

export default Unauthorized;