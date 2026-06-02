import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoSkynis from "../assets/logo Skynis.svg?react";
import "./css/cadastro.css";

export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem. Tente novamente!");
            return;
        }

        try {
            const resposta = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert("Conta criada com sucesso! Faça o login.");
                navigate("/login");
            } else {
                alert(dados.error || "Erro ao criar conta.");
            }
        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            alert("Erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="pagina-cadastro">
            <header className="header-cadastro">
                <Link to="/">
                    <LogoSkynis className="logo-svg" />
                </Link>
            </header>

            <main className="container-cadastro">
                <div className="card-cadastro">
                    <h1>Criar Conta</h1>

                    <form onSubmit={handleCadastro} className="form-cadastro">

                        <div className="grupo-input">
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />

                            <svg className="icone-input" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>

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


                        <div className="grupo-input">
                            <input
                                type={mostrarConfirmar ? "text" : "password"}
                                placeholder="Confirmar Senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                            />


                            <svg
                                className="icone-input clicavel"
                                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                {mostrarConfirmar ? (
                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                                ) : (
                                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                )}
                            </svg>
                        </div>

                        <button type="submit" className="btn-cadastrar-form">
                            Cadastrar
                        </button>
                    </form>

                    <p className="link-login">
                        Já tem conta? <Link to="/login">Entre aqui</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}