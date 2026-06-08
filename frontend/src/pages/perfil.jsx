import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Pencil, Save, User, X } from "lucide-react";
import Popup from "../components/popup";
import "./css/perfil.css";

const FAVORITOS_STORAGE_PREFIX = "filmes_favoritos";

const lerFavoritos = () => {
  try {
    const dados = JSON.parse(localStorage.getItem(obterChaveFavoritos()) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
};

const obterChaveFavoritos = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return FAVORITOS_STORAGE_PREFIX;

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return `${FAVORITOS_STORAGE_PREFIX}_${payload.sub}`;
  } catch {
    return FAVORITOS_STORAGE_PREFIX;
  }
};

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

export default function Perfil() {
  const navigate = useNavigate();
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
  const [filmesFavoritos] = useState(() => lerFavoritos());

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarDadosUsuario = async () => {
      try {
        const resposta = await fetch("http://localhost:8000/usuarios/me", {
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

    buscarDadosUsuario();
  }, [navigate]);

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

      const resposta = await fetch("http://localhost:8000/usuarios/me", {
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

  const renderizarCategorias = (categoriasData) => {
    const categorias = Array.isArray(categoriasData) ? categoriasData : [];
    return categorias.slice(0, 2).map((categoria) => (
      <span key={categoria.id || categoria.id_categoria || categoria.nome} className="tag">
        {categoria.nome}
      </span>
    ));
  };

  const solicitacoes = [
    { id: 101, titulo: "Cavaleiro das Trevas", detalhes: "$ 245 Milhoes - $ 250 Milhões", status: "Pendente", imagem: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
  ];

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


        <section className="secao-perfil">
          <h3>Filmes Favoritos ({filmesFavoritos.length})</h3>
          <div className="grid-favoritos">
            {filmesFavoritos.length > 0 ? filmesFavoritos.map((filme) => (
              <div key={`fav-${filme.id}`} className="card-filme-favorito">
                <div className="poster-container">
                  <img src={filme.poster} alt={filme.titulo} className="poster-filme" />

                  <div className="icone-coracao">
                    <Heart size={16} color="#e03c2f" fill="#e03c2f" />
                  </div>
                </div>
                <div className="card-info">
                  <h4 className="card-titulo">{filme.titulo}</h4>
                  <span className="card-ano">{filme.ano}</span>
                  <div className="card-tags">
                    {renderizarCategorias(filme.categorias)}
                  </div>
                  <button
                    className="btn-ver-detalhes-card"
                    onClick={() => navigate(`/filme/${filme.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            )) : (
              <p className="favoritos-vazio">Nenhum filme favoritado ainda.</p>
            )}
          </div>
        </section>


        <section className="secao-perfil">
          <h3>Solicitações de Edição ({solicitacoes.length})</h3>
          <div className="lista-solicitacoes">
            {solicitacoes.map((solic) => (
              <div key={solic.id} className="card-solicitacao">
                <div className="info-solicitacao-esquerda">
                  <img src={solic.imagem} alt={solic.titulo} className="thumb-solicitacao" />
                  <div className="textos-solicitacao">
                    <h4>{solic.titulo}</h4>
                    <p>{solic.detalhes}</p>
                  </div>
                </div>
                <div className="status-solicitacao">
                  <span className="badge-pendente">{solic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

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
