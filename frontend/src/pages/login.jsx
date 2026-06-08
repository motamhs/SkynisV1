import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import Popup from "../components/popup";
import LogoSkynis from "../assets/logo Skynis.svg?react";
import "./css/login.css";

function obterMensagemErro(dados, mensagemPadrao) {
    if (typeof dados?.detail === "string") return dados.detail;
    if (Array.isArray(dados?.detail) && dados.detail.length > 0) {
        return dados.detail.map((erro) => {
            const campo = erro.loc?.[erro.loc.length - 1];
            if (campo === "email" && erro.msg?.toLowerCase().includes("email")) {
                return "Informe um e-mail válido.";
            }
            return erro.msg?.replace("Value error, ", "") || mensagemPadrao;
        }).join("\n");
    }
    return dados?.error || mensagemPadrao;
}

export default function Login() {
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [popup, setPopup] = useState({ aberto: false });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const resposta = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
               
                body: JSON.stringify({ email: login.trim(), senha: senha }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                console.log("Login backend feito com sucesso!");

                localStorage.setItem("access_token", dados.access_token);
                localStorage.setItem("refresh_token", dados.refresh_token);

                navigate("/");
            } else {
                setPopup({
                    aberto: true,
                    tipo: "erro",
                    titulo: "Erro ao fazer login",
                    mensagem: obterMensagemErro(dados, "Erro ao fazer login. Verifique suas credenciais."),
                    textoConfirmar: "Fechar",
                    onFechar: () => setPopup({ aberto: false }),
                });
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            setPopup({
                aberto: true,
                tipo: "erro",
                titulo: "Erro de conexao",
                mensagem: "Erro ao conectar com o servidor.",
                textoConfirmar: "Fechar",
                onFechar: () => setPopup({ aberto: false }),
            });
        }
    };

    return (
        <div className="pagina-login">
            <header className="header-login">
                <Link to="/" className="logo-link">
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
                                placeholder="E-mail ou usuário"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                            />

                            <Mail className="icone-input" />
                        </div>

                        <div className="grupo-input">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />

                            {mostrarSenha ? (
                                <EyeOff
                                    className="icone-input clicavel"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                />
                            ) : (
                                <Eye
                                className="icone-input clicavel"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                />
                            )}
                        </div>

                        <button type="submit" className="btn-entrar-form">
                            Entrar
                        </button>
                    </form>

                    <p className="link-cadastro">
                        Não tem conta ? <Link to="/cadastro">Cadastre-se</Link>
                    </p>
                </div>
            </main>

            <Popup
                aberto={popup.aberto}
                tipo={popup.tipo}
                titulo={popup.titulo}
                mensagem={popup.mensagem}
                textoConfirmar={popup.textoConfirmar}
                onFechar={popup.onFechar}
            />
        </div>
    );
}
