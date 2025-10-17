import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Footer, Hero, Features, CTA } from '../components'
import { useAuthService } from '../hooks/useAuthService'

export default function LandingPage() {
  const { isAuthenticated } = useAuthService()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map')
    }
  }, [isAuthenticated, navigate])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <Hero />
        <Features />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}
