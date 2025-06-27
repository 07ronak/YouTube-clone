"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SignIn from "./sign-in";
import { onAuthStateChanedHelper } from "../firebase/firebase";
import { User } from "firebase/auth";
import Upload from "./upload";

function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  });

  return (
    <nav className="flex justify-between items-center p-4">
      <Link href="/">
        <Image
          src="/icons8-youtube-150.svg"
          alt="YouTube Logo"
          width={150}
          height={50}
        />
      </Link>
      {user && <Upload />}
      <SignIn user={user} />
    </nav>
  );
}

export default Navbar;
