"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div>
      <div>
        <div>
          <h1>Your Newsletter Dashboard</h1>
          <p>Manage your personalized newsletter preferences</p>
        </div>
        <div>
          <div>
            <h2>Current Preferences</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No preferences set yet</p>
              <Link
                href="/select"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Set Up Newsletter
              </Link>
            </div>
          </div>

          <div>
            <h2>Actions</h2>
            <div>
              <button onClick={() => router.push("/select")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-square-pen-icon lucide-square-pen"
                >
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                </svg>
                Update Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
