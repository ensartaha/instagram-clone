import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const veriler = await response.json();
      if (veriler.success) {
        localStorage.setItem("token", veriler.token);
        navigate("/");
      } else {
        setError(veriler.message);
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Backend çalışıyor mu?");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-logo">Instagram</h1>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            className="login-input"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <button type="submit" className="login-button">
            Giriş Yap
          </button>
        </form>
        <p className="register-link">
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
