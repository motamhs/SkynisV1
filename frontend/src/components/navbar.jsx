import { useLocation, useNavigate } from "react-router-dom";
import { Film, Home, LogIn, LogOut, Shield, User } from "lucide-react";
import "./css/navbar.css";

import LogoSkynis from "../assets/logo Skynis.svg?react";

const paginas = [
  { chave: "inicio", rotulo: "Inicio", icone: <Home />, roles: [null, "usuario", "admin"] },
  { chave: "filmes", rotulo: "Filmes", icone: <Film />, roles: [null, "usuario", "admin"] },
  { chave: "perfil", rotulo: "Perfil", icone: <User />, roles: ["usuario", "admin"] },
  { chave: "admin", rotulo: "Admin", icone: <Shield />, roles: ["admin"] },
];

export default function Navbar({ role = null, aoNavegar, aoSair }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const obterPaginaAtiva = () => {
    if (pathname === "/") return "inicio";
    if (pathname.startsWith("/filmes") || pathname.startsWith("/filme/")) return "filmes";
    if (pathname.startsWith("/perfil")) return "perfil";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/adicionar")) return "adicionar";
    return null;
  };

  const ativa = obterPaginaAtiva();

  const navegar = (chave) => {
    aoNavegar?.(chave);

    if (chave === "inicio") {
      navigate("/");
    } else {
      navigate(`/${chave}`);
    }
  };

  const visiveis = paginas.filter((p) => p.roles.includes(role));

  return (
    <nav className="barra">
      <div className="logo" onClick={() => navegar("inicio")}>
        <LogoSkynis className="logo-svg" />
      </div>

      <ul className="links">
        {visiveis.map((p) => (
          <li key={p.chave}>
            <button
              className={`item${ativa === p.chave ? " ativo" : ""}`}
              onClick={() => navegar(p.chave)}
            >
              {p.icone}
              {p.rotulo}
            </button>
          </li>
        ))}
      </ul>

      <div className="acoes">
        {role === null && (
          <button className="botao botao-entrar" onClick={() => navigate("/login")}>
            <LogIn />
            Login
          </button>
        )}

        {(role === "usuario" || role === "admin") && (
          <button className={`botao botao-adicionar${ativa === "adicionar" ? " ativo" : ""}`} onClick={() => navegar("adicionar")}>
            + Adicionar
          </button>
        )}

        {role !== null && (
          <button className="botao botao-sair" onClick={aoSair}>
            <LogOut />
            Sair
          </button>
        )}
      </div>
    </nav>
  );
}
