import { SignUp } from '@clerk/clerk-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fdf2f4, #fce7eb)' }}>
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#D92243' }}>Lost Friends</h1>
        <p className="mb-6" style={{ color: '#6b7280' }}>Create your account</p>
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          afterSignUpUrl="/chat"
        />
      </div>
    </div>
  )
}
