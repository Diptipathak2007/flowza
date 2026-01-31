import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ModeToggle } from "@/components/global/mode-toggle";

const Navigation = async () => {
  const user = await currentUser();
  
  return (
    <div className="p-4 flex items-center justify-between relative">
      <aside className="flex items-center gap-2">
        <Image
          src="/assets/flowza-logo.svg"
          alt="Flowza Logo"
          width={40}
          height={40}
        />
        <span className="text-xl font-bold">Flowza</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
            <Link href="/">About</Link>
            <Link href="/pricing">Features</Link>
            <Link href="/about">Pricing</Link>    
            <Link href="#">Documentation</Link>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link href={'/agency'} className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80">
            Launch App
        </Link>
        <UserButton/>
        <ModeToggle/>
      </aside>
    </div>
  )
}


export default Navigation;
