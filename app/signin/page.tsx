"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SigninPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const supabase = createClient();
  const router = useRouter();

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault();

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) throw error;
        setMsg("Check Your Email For The Confirmantion Link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (error) {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12px-4sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4ont-bold text-gray-900 mb-2">
            AI Powered Newsletter
          </h1>
          <p className="text-xl text-gray-600">
            {isSignup ? "Create Your Account" : "Sign In To Your Account"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">Error: {error}</p>
              </div>
            )} */}

          {msg && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-600">{msg}</p>
            </div>
          )}
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(p) => setPassword(p.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium cursor-pointer text-black bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 `}
              >
                {isSignup ? "Create Account" : "Sign In"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup((prev) => !prev)}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium cursor-pointer"
            >
              {isSignup
                ? "Already Have An Account ? Sign In"
                : "Don't have an account ? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
