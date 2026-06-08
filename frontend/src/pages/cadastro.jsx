import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, ShieldPlus, User } from "lucide-react";
import Popup from "../components/popup";
import LogoSkynis from "../assets/logo Skynis.svg?react";
import "./css/cadastro.css";

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

export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [apelido, setApelido] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [role, setRole] = useState("user");

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [popup, setPopup] = useState({ aberto: false });

    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            setPopup({
                aberto: true,
                tipo: "aviso",
                titulo: "Senhas diferentes",
                mensagem: "As senhas não coincidem. Tente novamente!",
                textoConfirmar: "Fechar",
                onFechar: () => setPopup({ aberto: false }),
            });
            return;
        }

        try {
            const resposta = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nome.trim(),
                    apelido: apelido.trim(),
                    email: email.trim(),
                    senha,
                    role,
                }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                setPopup({
                    aberto: true,
                    tipo: "sucesso",
                    titulo: "Conta criada com sucesso",
                    mensagem: "Agora faca o login para entrar no Skynis.",
                    textoConfirmar: "Ir para login",
                    onFechar: () => navigate("/login"),
                });
            } else {
                setPopup({
                    aberto: true,
                    tipo: "erro",
                    titulo: "Erro ao criar conta",
                    mensagem: obterMensagemErro(dados, "Erro ao criar conta."),
                    textoConfirmar: "Fechar",
                    onFechar: () => setPopup({ aberto: false }),
                });
            }
        } catch (erro) {
            console.error("Erro no cadastro:", erro);
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
        <div className="pagina-cadastro">
            <header className="header-cadastro">
                <Link to="/" className="logo-link">
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

                            <User className="icone-input" />
                        </div>

                        <div className="grupo-input">
                            <input
                                type="text"
                                placeholder="Nome de usuário"
                                value={apelido}
                                onChange={(e) => setApelido(e.target.value)}
                                required
                            />

                            <User className="icone-input" />
                        </div>

                        <div className="grupo-input">
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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


                        <div className="grupo-input">
                            <input
                                type={mostrarConfirmar ? "text" : "password"}
                                placeholder="Confirmar Senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                            />


                            {mostrarConfirmar ? (
                                <EyeOff
                                    className="icone-input clicavel"
                                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                />
                            ) : (
                                <Eye
                                    className="icone-input clicavel"
                                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                />
                            )}
                        </div>

                        <div className="grupo-input">
                            <select
                                className="select-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>

                            <ShieldPlus className="icone-input" />
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
