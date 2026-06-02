import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoSkynis from "../assets/logo Skynis.svg?react";
import "./css/login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const formData = new URLSearchParams();
            formData.append("email", email);
            formData.append("password", senha);

            const resposta = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
               
                body: JSON.stringify({ email: email, senha: senha }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                console.log("Login backend feito com sucesso!");

                localStorage.setItem("access_token", dados.access_token);
                localStorage.setItem("refresh_token", dados.refresh_token);

                navigate("/");
            } else {
                alert(dados.error || "Erro ao fazer login. Verifique suas credenciais.");
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="pagina-login">
            <header className="header-login">
                <Link to="/">
                    <LogoSkynis className="logo-svg" />
                </Link>
            </header>

            <main className="container-login">
                <div className="card-login">
                    <h1>Entrar</h1>

                    <form onSubmit={handleLogin} className="form-login">
                        <div className="grupo-input">
                            <input
                                type="text"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <svg className="icone-input" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M22 6l-10 7L2 6" />
                            </svg>
                        </div>

                        <div className="grupo-input">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />

                            <svg
                                className="icone-input clicavel"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                {mostrarSenha ? (
                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                                ) : (
                                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                )}
                            </svg>
                        </div>

                        <button type="submit" className="btn-entrar-form">
                            Entrar
                        </button>
                    </form>

                    <div className="divisor">
                        <span>OU</span>
                    </div>

                    <div className="botoes-alternativos">
                        <button type="button" className="btn-alternativo">

                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuar com Google
                        </button>
                    </div>

                    <p className="link-cadastro">
                        Não tem conta ? <Link to="/cadastro">Cadastre-se</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}