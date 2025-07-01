import React, {useContext} from 'react';
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Globe, Newspaper, User2Icon, Wand} from "lucide-react";
import {redirect, usePathname} from "next/navigation";
import {AuthContext, User} from "@/contexts/auth-context";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";

interface NavbarProps {
  user?: User;
}

function Navbar({user}: NavbarProps) {
  const pathname = usePathname();

  const {logOut} = useContext(AuthContext);

  return (
    <div
      className="flex border-b py-2 sm:py-4 px-4 items-center justify-between shadow sticky top-0 w-full bg-white z-50">
      <div className="flex items-center">
        <Link href={"/"}>
          <Image
            src="/logo.svg"
            alt="NewsFlow Logo"
            width={180}
            height={5}
            className="w-24 sm:w-32 md:w-40 lg:w-44 h-auto"
          />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {user ? <>
          <Button variant="secondary" asChild>
            {pathname === '/articles' ? <Link href="/"><Newspaper/>Public Feed</Link> : <Link href="/articles"><Newspaper/>Custom Feed</Link>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <User2Icon></User2Icon>
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onClick={() => redirect('/preferences')}>
                  Preferences
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator/>
              <DropdownMenuItem className="cursor-pointer" onClick={logOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu></> : <>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="ghost">
            <Link href="/register">Register</Link>
          </Button>
        </>}
      </div>
    </div>
  );
}

export default Navbar;
