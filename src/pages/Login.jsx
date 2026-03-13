import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LoginSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { login, signup, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await signup(email, password);
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error.code, error.message);
      let errorMsg = 'Login failed. ';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMsg += 'Invalid email/password.';
          break;
        case 'auth/invalid-email':
          errorMsg += 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMsg += 'Password too weak.';
          break;
        case 'auth/email-already-in-use':
          errorMsg += 'Email already registered. Try login.';
          break;
        case 'auth/network-request-failed':
          errorMsg += 'Network error. Check connection.';
          break;
        case 'auth/operation-not-allowed':
          errorMsg += 'Auth disabled in Firebase. Contact admin.';
          break;
        default:
          errorMsg += error.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <span style={styles.icon}>⛪</span>
          </div>
          <h1 style={styles.title}>Church Engagement Platform</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="pastor@church.com"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#5568d3')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#667eea')}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.toggle}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={styles.toggleButton}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: '28rem',
    width: '100%',
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '2.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconCircle: {
    width: '4rem',
    height: '4rem',
    background: '#667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  icon: {
    fontSize: '2rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0,
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    background: '#667eea',
    color: 'white',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    transition: 'all 0.3s',
    marginTop: '0.5rem',
  },
  toggle: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  toggleButton: {
    color: '#667eea',
    background: 'none',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.5rem',
  },
};
