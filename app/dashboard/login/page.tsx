import { auth } from "@/auth/auth.node";
import { SignIn } from "@/components/auth/sign-in";
import Footer from "@/components/layout/footer";
import { redirect } from "next/navigation";


interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}


export default async function LoginPage({ searchParams }: PageProps) {
   const { callbackUrl } = await searchParams;

  // Redirect if already logged in
   const session = await auth();

  if (session?.user) {
    // If user is logged in, send them to callback or dashboard
    redirect(callbackUrl ?? "/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="w-full max-w-md rounded-2xl shadow-md p-6 bg-white dark:bg-neutral-800">
        <h1 className="text-2xl font-bold text-center mb-6">Sign in</h1>

        <div className="flex flex-col gap-4">
          {/* Google Sign In */}
          <SignIn
            provider="google"
            className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.6 12.23c0-.79-.07-1.54-.2-2.27H12v4.3h5.4c-.23 1.24-.93 2.28-1.97 2.98v2.49h3.17c1.86-1.72 2.93-4.26 2.93-7.5z"
              />
              <path
                fill="currentColor"
                d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.17-2.49c-.88.6-2 1-3.44 1-2.65 0-4.9-1.79-5.7-4.2H3v2.63C4.64 19.88 8.06 22 12 22z"
              />
              <path
                fill="currentColor"
                d="M6.3 13.87A5.99 5.99 0 0 1 6 12c0-.65.11-1.27.3-1.87V7.5H3A9.97 9.97 0 0 0 2 12c0 1.61.39 3.13 1.09 4.5l3.21-2.63z"
              />
              <path
                fill="currentColor"
                d="M12 6.5c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.95 3.54 14.69 2.5 12 2.5 8.06 2.5 4.64 4.62 3 7.5l3.3 2.63c.8-2.41 3.05-4.13 5.7-4.13z"
              />
            </svg>
            Sign in with Google
          </SignIn>

          {/* Apple Sign In
          <SignIn
            provider="apple"
            className="w-full bg-black text-white rounded-lg py-2 hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
             Sign in with Apple
          </SignIn> */}

          {/* Magic Link */}
          <SignIn
            provider="nodemailer"
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
          >
            Send me a Magic Link
          </SignIn>
        </div>
      </div>
      <Footer />
    </div>
  );
}
