import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { EyeIcon, EyeOffIcon } from "./Icons";

export default function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) =>
      setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const handleLogin = async () => {
  setError("");

  if (!form.email || !form.password) {
    setError("Please fill in all fields.");
    return;
  }

  setLoading(true);

  try {
    // 🔴 ADMIN LOGIN (HARD CODED)
    if (
      form.email === "yourlocalshopadmin@gmail.com" &&
      form.password === "admin123"
    ) {
      localStorage.setItem("role", "admin");
      localStorage.setItem("email", form.email);

      setLoading(false);
      onLogin && onLogin();
      return;
    }

    // 🟢 NORMAL USER LOGIN (FIREBASE)
    const userCredential = await signInWithEmailAndPassword(
      auth,
      form.email,
      form.password
    );

    const user = userCredential.user;

    localStorage.setItem("role", "customer");
    localStorage.setItem("uid", user.uid);

    onLogin && onLogin();

  } catch (err) {
    setError("Invalid email or password.");
  }

  setLoading(false);
};

  const handleRegister = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, { displayName: form.name });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: form.name,
        email: form.email,
        role: "customer",
        createdAt: serverTimestamp(),
      });
      onLogin && onLogin();
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Email already in use.");
      else setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #d4e6d8", background: "#fff", fontSize: 14,
    color: "#1a2e1a", outline: "none", boxSizing: "border-box",
  };

  return (
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <div style={{ width: "45%", background: "#1e3d2f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>Your Local Shop</h1>
          <p style={{ color: "#8fba9f", fontSize: 14, margin: 0 }}>Online Convenience Store</p>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: 40 }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1a2e1a", margin: "0 0 6px" }}>
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p style={{ fontSize: 13, color: "#5c7a5c", margin: "0 0 28px" }}>
              {isLogin ? "Log in to get started shopping" : "Fill in the details below to register"}
            </p>

            <div style={{ background: "#f0f7f1", borderRadius: 12, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                  <div style={{ background: "#fff0f0", border: "1px solid #f4b8b8", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b" }}>
                    {error}
                  </div>
              )}

              {!isLogin && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Full Name</label>
                    <input name="name" value={form.name} onChange={handle} placeholder="Enter Your Name" style={inputStyle} />
                  </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Email Address</label>
                <input name="email" value={form.email} onChange={handle} placeholder="Enter Your Email" type="email" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handle} placeholder="Enter Your Password" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Confirm Password</label>
                    <input name="confirm" type="password" value={form.confirm} onChange={handle} placeholder="Confirm Your Password" style={inputStyle} />
                  </div>
              )}

              {isLogin && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3d5a40", cursor: "pointer" }}>
                      <input type="checkbox" name="remember" checked={form.remember} onChange={handle} />
                      Remember me
                    </label>
                    <span style={{ fontSize: 13, color: "#2d6a4f", cursor: "pointer", fontWeight: 500 }}>Forgot password?</span>
                  </div>
              )}

              <button
                  onClick={isLogin ? handleLogin : handleRegister}
                  disabled={loading}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: loading ? "#9bbfaa" : "#2d6a4f", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "#5c7a5c", margin: 0 }}>
                {isLogin ? (
                    <>Don't have an account?{" "}
                      <span onClick={() => { setIsLogin(false); setError(""); }} style={{ color: "#2d6a4f", fontWeight: 600, cursor: "pointer" }}>Register here</span>
                    </>
                ) : (
                    <>Already have an account?{" "}
                      <span onClick={() => { setIsLogin(true); setError(""); }} style={{ color: "#2d6a4f", fontWeight: 600, cursor: "pointer" }}>Login here</span>
                    </>
                )}
              </p>

              {isLogin && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "#8fba9f", margin: 0 }}>
                    Your role will be checked automatically after login.
                  </p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}