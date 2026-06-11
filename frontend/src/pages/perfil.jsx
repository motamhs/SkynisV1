import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Pencil, Save, User, X } from "lucide-react";
import { SecaoFavoritosPerfil, SecaoSolicitacoesPerfil } from "../components/SecoesPerfil";
import Popup from "../components/popup";
import "./css/perfil.css";

const API_URL = "http://localhost:8000";

const criarFormPerfil = (usuario) => ({
  nome: usuario?.nome || "",
  apelido: usuario?.apelido || "",
  email: usuario?.email || "",
  imagem: usuario?.imagem || "",
});

const formatarValorPopup = (valor) => {
  if (!valor) return "Vazio";
  const texto = String(valor);
  return texto.length > 100 ? `${texto.slice(0, 97)}...` : texto;
};

const usuarioEhAdmin = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "admin";
  } catch {
    return false;
  }
};

export default function Perfil() {
  const navigate = useNavigate();
  const admin = usuarioEhAdmin();
  const [usuario, setUsuario] = useState({
    nome: "",
    apelido: "",
    email: "",
    imagem: ""
  });
  const [formPerfil, setFormPerfil] = useState(criarFormPerfil(null));
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [popup, setPopup] = useState({ aberto: false });
  const [filmesFavoritos, setFilmesFavoritos] = useState([]);
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(true);
  const [solicitacoesEdicao, setSolicitacoesEdicao] = useState([]);
  const [carregandoSolicitacoes, setCarregandoSolicitacoes] = useState(!admin);
  const [solicitacoesAdicao, setSolicitacoesAdicao] = useState([]);
  const [carregandoAdicoes, setCarregandoAdicoes] = useState(!admin);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarDadosUsuario = async () => {
      try {
        const resposta = await fetch(`${API_URL}/usuarios/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
          const dados = await resposta.json();

          setUsuario({
            nome: dados.nome || "",
            apelido: dados.apelido || "",
            email: dados.email || "",
            imagem: dados.imagem || "",
          });
          setFormPerfil(criarFormPerfil(dados));
        } else {

          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);
      }
    };

    const buscarFavoritos = async () => {
      try {
        setCarregandoFavoritos(true);

        const resposta = await fetch(`${API_URL}/favoritos`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!resposta.ok) {
          throw new Error("Erro ao buscar favoritos.");
        }

        setFilmesFavoritos(await resposta.json());
      } catch (erro) {
        console.error("Erro ao buscar favoritos:", erro);
        setFilmesFavoritos([]);
      } finally {
        setCarregandoFavoritos(false);
      }
    };

    const buscarSolicitacoes = async () => {
      try {
        setCarregandoSolicitacoes(true);

        const resposta = await fetch(`${API_URL}/filmes/edicoes/minhas`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!resposta.ok) {
          throw new Error("Erro ao buscar solicitacoes.");
        }

        setSolicitacoesEdicao(await resposta.json());
      } catch (erro) {
        console.error("Erro ao buscar solicitacoes:", erro);
        setSolicitacoesEdicao([]);
      } finally {
        setCarregandoSolicitacoes(false);
      }
    };

    const buscarAdicoes = async () => {
      try {
        setCarregandoAdicoes(true);

        const resposta = await fetch(`${API_URL}/filmes/minhas-adicoes`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!resposta.ok) {
          throw new Error("Erro ao buscar solicitacoes de adicao.");
        }

        setSolicitacoesAdicao(await resposta.json());
      } catch (erro) {
        console.error("Erro ao buscar solicitacoes de adicao:", erro);
        setSolicitacoesAdicao([]);
      } finally {
        setCarregandoAdicoes(false);
      }
    };

    buscarDadosUsuario();
    buscarFavoritos();

    if (!admin) {
      buscarSolicitacoes();
      buscarAdicoes();
    }
  }, [navigate, admin]);

  const fecharPopup = () => setPopup({ aberto: false });

  const nomeCompletoUsuario = usuario.nome;

  const abrirEdicaoPerfil = () => {
    setFormPerfil(criarFormPerfil(usuario));
    setEditandoPerfil(true);
  };

  const cancelarEdicaoPerfil = () => {
    setFormPerfil(criarFormPerfil(usuario));
    setEditandoPerfil(false);
  };

  const atualizarCampoPerfil = (campo, valor) => {
    setFormPerfil((atual) => ({ ...atual, [campo]: valor }));
  };

  const obterAlteracoesPerfil = () => {
    const original = criarFormPerfil(usuario);
    const campos = [
      ["nome", "Nome"],
      ["apelido", "Nome de usuario"],
      ["email", "E-mail"],
      ["imagem", "Imagem"],
    ];

    const alteracoes = campos
      .filter(([campo]) => String(original[campo] || "") !== String(formPerfil[campo] || ""))
      .map(([campo, label]) => ({
        label,
        valor: `${formatarValorPopup(original[campo])} -> ${formatarValorPopup(formPerfil[campo])}`,
      }));


    return alteracoes;
  };

  const montarPayloadPerfil = () => {
    const payload = {
      nome: formPerfil.nome.trim(),
      apelido: formPerfil.apelido.trim(),
      email: formPerfil.email.trim(),
      imagem: formPerfil.imagem.trim() || null,
    };

    return payload;
  };

  const solicitarConfirmacaoPerfil = (event) => {
    event.preventDefault();

    const alteracoes = obterAlteracoesPerfil();

    if (alteracoes.length === 0) {
      setPopup({
        aberto: true,
        tipo: "info",
        titulo: "Nada para atualizar",
        mensagem: "Nenhum dado do perfil foi alterado.",
        textoConfirmar: "Entendi",
        onFechar: fecharPopup,
      });
      return;
    }

    setPopup({
      aberto: true,
      tipo: "confirmacao",
      titulo: "Deseja realmente atualizar seu perfil?",
      mensagem: "Confira os dados antes de salvar.",
      detalhes: alteracoes,
      textoConfirmar: "Atualizar",
      textoCancelar: "Voltar",
      onCancelar: fecharPopup,
      onConfirmar: () => salvarPerfil(montarPayloadPerfil(), alteracoes),
    });
  };

  const salvarPerfil = async (payload, alteracoes) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSalvandoPerfil(true);
      setPopup((atual) => ({ ...atual, carregando: true }));

      const resposta = await fetch(`${API_URL}/usuarios/me`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao atualizar perfil.");
      }

      const dados = await resposta.json();
      const usuarioAtualizado = {
        nome: dados.nome || "",
        apelido: dados.apelido || "",
        email: dados.email || "",
        imagem: dados.imagem || "",
      };

      setUsuario(usuarioAtualizado);
      setFormPerfil(criarFormPerfil(usuarioAtualizado));
      setEditandoPerfil(false);
      setPopup({
        aberto: true,
        tipo: "sucesso",
        titulo: "Perfil atualizado com sucesso",
        mensagem: "Suas informacoes foram salvas.",
        detalhes: alteracoes,
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    } catch (erro) {
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao atualizar perfil",
        mensagem: erro.message || "Erro ao atualizar perfil.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    } finally {
      setSalvandoPerfil(false);
    }
  };

  return (
    <div className="pagina-perfil">
      <div className="perfil-container-interno">


        <section className="card-usuario">
          <div className="avatar-usuario">
            {usuario.imagem ? (
              <img src={usuario.imagem} alt={nomeCompletoUsuario || usuario.apelido || "Usuario"} />
            ) : (
              <User size={32} color="#e03c2f" />
            )}
          </div>
          <div className="dados-usuario">
            <h2>{nomeCompletoUsuario || usuario.apelido || "Usuario"}</h2>
            {usuario.apelido ? <span className="apelido-usuario">@{usuario.apelido}</span> : null}
            <p className="email-usuario">
              <Mail size={14} />
              {usuario.email}
            </p>
            <button className="btn-editar-perfil" onClick={abrirEdicaoPerfil}>
              <Pencil size={14} />
              Editar perfil
            </button>
          </div>
        </section>

        {editandoPerfil && (
          <div className="modal-perfil-overlay" role="dialog" aria-modal="true" aria-labelledby="titulo-editar-perfil">
            <form className="form-editar-perfil" onSubmit={solicitarConfirmacaoPerfil}>
              <div className="form-perfil-header">
                <h2 id="titulo-editar-perfil">Editar perfil</h2>
                <button type="button" className="btn-fechar-perfil" onClick={cancelarEdicaoPerfil}>
                  <X size={18} />
                  Cancelar
                </button>
              </div>

              <div className="grid-editar-perfil">
                <label className="grupo-perfil">
                  <span>Nome</span>
                  <input value={formPerfil.nome} onChange={(event) => atualizarCampoPerfil("nome", event.target.value)} required />
                </label>


                <label className="grupo-perfil">
                  <span>Nome de usuario</span>
                  <input value={formPerfil.apelido} onChange={(event) => atualizarCampoPerfil("apelido", event.target.value)} required />
                </label>

                <label className="grupo-perfil">
                  <span>E-mail</span>
                  <input type="email" value={formPerfil.email} onChange={(event) => atualizarCampoPerfil("email", event.target.value)} required />
                </label>

                <label className="grupo-perfil grupo-perfil-largo">
                  <span>URL da imagem</span>
                  <input value={formPerfil.imagem} onChange={(event) => atualizarCampoPerfil("imagem", event.target.value)} placeholder="https://..." />
                </label>
              </div>

              <button type="submit" className="btn-salvar-perfil" disabled={salvandoPerfil}>
                <Save size={18} />
                {salvandoPerfil ? "Salvando..." : "Salvar perfil"}
              </button>
            </form>
          </div>
        )}


        <SecaoFavoritosPerfil
          filmes={filmesFavoritos}
          carregando={carregandoFavoritos}
          onDetalhes={(filmeId) => navigate(`/filme/${filmeId}`)}
        />


        {!admin && (
          <SecaoSolicitacoesPerfil
            titulo="Solicitacoes de Adicao"
            vazio="Nenhuma solicitacao de adicao enviada."
            carregandoTexto="Carregando solicitacoes de adicao..."
            solicitacoes={solicitacoesAdicao}
            carregando={carregandoAdicoes}
            tipo="adicao"
          />
        )}


        {!admin && (
          <SecaoSolicitacoesPerfil
            titulo="Solicitacoes de Edicao"
            vazio="Nenhuma solicitacao de edicao enviada."
            carregandoTexto="Carregando solicitacoes..."
            solicitacoes={solicitacoesEdicao}
            carregando={carregandoSolicitacoes}
            tipo="edicao"
          />
        )}

      </div>

      <Popup
        aberto={popup.aberto}
        tipo={popup.tipo}
        titulo={popup.titulo}
        mensagem={popup.mensagem}
        detalhes={popup.detalhes}
        textoConfirmar={popup.textoConfirmar}
        textoCancelar={popup.textoCancelar}
        onConfirmar={popup.onConfirmar}
        onCancelar={popup.onCancelar}
        onFechar={popup.onFechar}
        carregando={popup.carregando}
      />
    </div>
  );
}

