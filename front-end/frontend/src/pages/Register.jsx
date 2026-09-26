import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./Login.css";

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const veriler = await response.json();

      if (veriler.success) {
        // Seçenek A: direkt giriş yaptır
        localStorage.setItem('token', veriler.token);
        navigate('/');
        // Seçenek B: login sayfasına yönlendir
        // navigate('/login');
      } else {
        setError(veriler.message);
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-logo">Instagram</h1>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            className="login-input"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Şifreyi onayla"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="register-link">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;