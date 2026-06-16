import { SignUp } from '@clerk/react'

export default function SignupPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdf2f4, #fce7eb)', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#D92243', marginBottom: '8px' }}>Lost Friends</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create your account</p>
        <div id="clerk-signup">
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
