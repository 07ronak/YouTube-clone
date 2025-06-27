"use client";
import { User } from "firebase/auth";
import { signInWithGoogle, signOutUser } from "../firebase/firebase";
import { CircleUserRound, LogOut } from "lucide-react";
interface SignInProps {
  user: User | null;
}

function SignIn({ user }: SignInProps) {
  return (
    <>
      {user ? (
        <button
          onClick={signOutUser}
          className="flex items-center space-x-2 px-4 py-1 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex items-center space-x-2 px-4 py-1 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <CircleUserRound className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      )}
    </>
  );
}

export default SignIn;
