import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import "./layout.css";

const obterRole = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return payloadJson.role === "user" ? "usuario" : payloadJson.role;
  } catch (e) {
    console.error("Erro ao ler token:", e);
    return null;
  }
};

export default function Layout() {
  useLocation();
  const navigate = useNavigate();
  const role = obterRole();

  const tratarSair = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      try {
        await fetch("http://localhost:8000/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (e) {
        console.error("Erro no logout:", e);
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="layout-container">
      <Navbar role={role} aoSair={tratarSair} />

      <main className="conteudo-principal">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
