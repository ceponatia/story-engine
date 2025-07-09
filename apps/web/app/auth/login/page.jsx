import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() {
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>);
}
export const metadata = {
    title: "Sign In - Story Engine",
    description: "Sign in to your Story Engine account",
};
