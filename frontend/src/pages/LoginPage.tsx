import { useState } from 'react';
import { useAuthService } from '../hooks/useAuthService';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const authService = useAuthService();
  const navigate = useNavigate();

  const handleRequestToken = async () => {
    try {
      await authService.requestLogin({ email });
      setEmailSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send login email. Please try again.');
    }
  };

  const handleVerifyToken = async () => {
    try {
      await authService.verifyLogin({ token });
      navigate('/app');
    } catch (err) {
      setError('Failed to verify token. Please try again.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!emailSent ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleRequestToken}>Request Token</button>
        </div>
      ) : (
        <div>
          <p>An email with a login token has been sent to {email}.</p>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your token"
          />
          <button onClick={handleVerifyToken}>Verify Token</button>
        </div>
      )}
    </div>
  );
}
