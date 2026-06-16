import { SignIn } from '@clerk/react'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdf2f4, #fce7eb)', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#D92243', marginBottom: '8px' }}>Lost Friends</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Find your people</p>
        <div id="clerk-signin">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            afterSignInUrl="/chat"
          />
        </div>
      </div>
    </div>
  )
}
