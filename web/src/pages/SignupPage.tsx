import { SignUp } from '@clerk/clerk-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Lost Friends</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create your account</p>
        </div>
        <div className="card p-6 flex justify-center">
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            afterSignUpUrl="/chat"
          />
        </div>
      </div>
    </div>
  )
}
