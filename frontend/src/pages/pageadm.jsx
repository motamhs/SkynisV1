import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, Film, Pencil, Trash2, X } from "lucide-react";
import Popup from "../components/popup";
import { AUXILIARES_VAZIOS, idDoItem, nomeItem } from "../utils/movieForm";
import "./css/pageadm.css";

const API_URL = "http://localhost:8000";
const POSTER_PADRAO = "https://placehold.co/160x240/111111/e03c2f?text=Sem+Poster";

const getIdFilme = (filme) => filme?.id || filme?.id_filme;

const formatarData = (valor) => {
  if (!valor) return "";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "" : data.toLocaleDateString("pt-BR");
};

const formatarValor = (valor) => {
  if (Array.isArray(valor)) return valor.length > 0 ? valor.join(", ") : "Nenhum";
  if (valor === null || valor === undefined || valor === "") return "Vazio";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
};

const normalizarValorComparacao = (valor, campo) => {
  if (campo === "orcamento" || campo === "ano") {
    const numero = Number(valor);
    return Number.isNaN(numero) ? "" : String(numero);
  }

  if (Array.isArray(valor)) {
    return valor
      .map((item) => {
        if (item && typeof item === "object") return item.id ?? item.id_filme ?? item.nome ?? JSON.stringify(item);
        return item;
      })
      .filter((item) => item !== undefined && item !== null && item !== "")
      .map(String)
      .sort()
      .join("|");
  }

  if (valor === null || valor === undefined || valor === "") return "";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
};

const camposRelacionados = {
  ids_atores: ["atores", "id_ator"],
  ids_categorias: ["categorias", "id_categoria"],
  ids_diretores: ["diretores", "id_diretor"],
  ids_linguagens: ["linguagens", "id_linguagem"],
  ids_paises: ["paises", "id_pais"],
  ids_produtoras: ["produtoras", "id_produtora"],
};

const rotulosCampos = {
  titulo: "Titulo",
  ano: "Ano",
  duracao: "Duracao",
  orcamento: "Orcamento",
  sinopse: "Sinopse",
  poster: "Poster",
  banner: "Banner",
  trailer: "Trailer",
  ids_atores: "Atores",
  ids_categorias: "Categorias",
  ids_diretores: "Diretores",
  ids_linguagens: "Idiomas",
  ids_paises: "Paises",
  ids_produtoras: "Produtoras",
};

const obterValorAtualFilme = (filme, campo) => {
  const relacionamento = camposRelacionados[campo];

  if (!relacionamento) return filme?.[campo];

  const [chave, campoId] = relacionamento;
  return Array.isArray(filme?.[chave])
    ? filme[chave].map((item) => item?.id ?? item?.[campoId]).filter((item) => item !== undefined && item !== null)
    : [];
};

const obterNomePorId = (id, listas, campoId) => {
  const item = listas
    .flat()
    .find((opcao) => String(idDoItem(opcao, campoId)) === String(id));

  return item ? nomeItem(item) : `ID ${id}`;
};

const formatarValorCampo = (campo, valor, edicao, auxiliares) => {
  const relacionamento = camposRelacionados[campo];

  if (!relacionamento) return formatarValor(valor);

  const [chave, campoId] = relacionamento;
  const listaAtualFilme = Array.isArray(edicao?.filme?.[chave]) ? edicao.filme[chave] : [];
  const listaAuxiliar = Array.isArray(auxiliares?.[chave]) ? auxiliares[chave] : [];
  const ids = Array.isArray(valor) ? valor : [];
  const nomes = ids.map((id) => obterNomePorId(id, [listaAtualFilme, listaAuxiliar], campoId));

  return formatarValor(nomes);
};

const obterResumoEdicao = (edicao, auxiliares) =>
  Object.entries(edicao?.dados || {})
    .map(([campo, valorNovo]) => {
      const valorAntigo = obterValorAtualFilme(edicao?.filme, campo);

      return {
        campo,
        label: rotulosCampos[campo] || campo,
        antes: formatarValorCampo(campo, valorAntigo, edicao, auxiliares),
        depois: formatarValorCampo(campo, valorNovo, edicao, auxiliares),
        alterado: normalizarValorComparacao(valorAntigo, campo) !== normalizarValorComparacao(valorNovo, campo),
      };
    })
    .filter((item) => item.alterado);

export default function Admin() {
  const [filmes, setFilmes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [edicoesPendentes, setEdicoesPendentes] = useState([]);
  const [auxiliares, setAuxiliares] = useState(AUXILIARES_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [popup, setPopup] = useState({ aberto: false });
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const fecharPopup = () => setPopup({ aberto: false });

  const usuarioEhAdmin = useCallback(() => {
    if (!token) return false;

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = JSON.parse(
        atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
      );

      return payloadJson.role === "admin";
    } catch (erro) {
      console.error("Erro ao ler token de admin:", erro);
      return false;
    }
  }, [token]);

  const buscarDadosAdmin = useCallback(async () => {
    try {
      setCarregando(true);

      const [
        respFilmes,
        respPendentes,
        respEdicoes,
        respAtores,
        respCategorias,
        respDiretores,
        respLinguagens,
        respPaises,
        respProdutoras,
      ] = await Promise.all([
        fetch(`${API_URL}/filmes`),
        fetch(`${API_URL}/filmes/pendentes`, {
          headers: { "Authorization": `Bearer ${token}` },
        }),
        fetch(`${API_URL}/filmes/edicoes/pendentes`, {
          headers: { "Authorization": `Bearer ${token}` },
        }),
        fetch(`${API_URL}/dados/atores`),
        fetch(`${API_URL}/dados/categorias`),
        fetch(`${API_URL}/dados/diretores`),
        fetch(`${API_URL}/dados/linguagens`),
        fetch(`${API_URL}/dados/paises`),
        fetch(`${API_URL}/dados/produtoras`),
      ]);

      if (respFilmes.ok) {
        const dadosFilmes = await respFilmes.json();
        setFilmes(dadosFilmes.filter((filme) => filme.flag === 1 || filme.flag === true));
      }

      if (respPendentes.ok) {
        setPendentes(await respPendentes.json());
      } else if (respPendentes.status === 401 || respPendentes.status === 403) {
        navigate("/");
      }

      if (respEdicoes.ok) {
        setEdicoesPendentes(await respEdicoes.json());
      }

      setAuxiliares({
        atores: respAtores.ok ? await respAtores.json() : [],
        categorias: respCategorias.ok ? await respCategorias.json() : [],
        diretores: respDiretores.ok ? await respDiretores.json() : [],
        linguagens: respLinguagens.ok ? await respLinguagens.json() : [],
        paises: respPaises.ok ? await respPaises.json() : [],
        produtoras: respProdutoras.ok ? await respProdutoras.json() : [],
      });
    } catch (erro) {
      console.error("Erro ao buscar dados do painel:", erro);
    } finally {
      setCarregando(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!usuarioEhAdmin()) {
      navigate("/");
      return;
    }

    buscarDadosAdmin();
  }, [token, navigate, usuarioEhAdmin, buscarDadosAdmin]);

  const handleAprovarFilme = async (idFilme) => {
    try {
      const resp = await fetch(`${API_URL}/filmes/${idFilme}/aprovar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!resp.ok) throw new Error("Nao foi possivel aprovar o filme.");

      const filmeAprovado = pendentes.find((filme) => getIdFilme(filme) === idFilme);
      setPendentes((atuais) => atuais.filter((filme) => getIdFilme(filme) !== idFilme));
      if (filmeAprovado) setFilmes((atuais) => [...atuais, { ...filmeAprovado, flag: true }]);

      setPopup({
        aberto: true,
        tipo: "sucesso",
        titulo: "Filme aprovado com sucesso",
        mensagem: "O filme agora aparece no catalogo.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    } catch (erro) {
      console.error(erro);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao aprovar filme",
        mensagem: erro.message || "Nao foi possivel aprovar o filme.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    }
  };

  const executarDeletarFilme = async (idFilme, isPendente = false, titulo = "filme") => {
    try {
      setPopup((atual) => ({ ...atual, carregando: true }));

      const resp = await fetch(`${API_URL}/filmes/${idFilme}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!resp.ok) throw new Error("Nao foi possivel excluir este filme.");

      if (isPendente) {
        setPendentes((atuais) => atuais.filter((filme) => getIdFilme(filme) !== idFilme));
      } else {
        setFilmes((atuais) => atuais.filter((filme) => getIdFilme(filme) !== idFilme));
      }

      setPopup({
        aberto: true,
        tipo: "sucesso",
        titulo: "Filme excluido com sucesso",
        mensagem: `"${titulo}" foi removido do catalogo.`,
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    } catch (erro) {
      console.error(erro);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao excluir filme",
        mensagem: erro.message || "Nao foi possivel excluir este filme.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    }
  };

  const handleDeletarFilme = (filme, isPendente = false) => {
    const idFilme = getIdFilme(filme);

    setPopup({
      aberto: true,
      tipo: "confirmacao",
      titulo: "Certeza que deseja excluir filme?",
      mensagem: `Esta acao vai remover "${filme.titulo}" do catalogo.`,
      detalhes: [{ label: "Filme", valor: `${filme.titulo} - ID ${idFilme}` }],
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar",
      onCancelar: fecharPopup,
      onConfirmar: () => executarDeletarFilme(idFilme, isPendente, filme.titulo),
    });
  };

  const analisarEdicao = async (edicao, acao) => {
    try {
      const resp = await fetch(`${API_URL}/filmes/edicoes/${edicao.id_solicitacao}/${acao}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!resp.ok) {
        const erroResposta = await resp.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Nao foi possivel analisar a solicitacao.");
      }

      setEdicoesPendentes((atuais) =>
        atuais.filter((item) => item.id_solicitacao !== edicao.id_solicitacao)
      );

      if (acao === "aprovar") buscarDadosAdmin();

      setPopup({
        aberto: true,
        tipo: "sucesso",
        titulo: acao === "aprovar" ? "Edicao aprovada" : "Edicao rejeitada",
        mensagem: acao === "aprovar"
          ? "A solicitacao foi aplicada ao filme."
          : "A solicitacao foi marcada como rejeitada.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    } catch (erro) {
      console.error(erro);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao analisar edicao",
        mensagem: erro.message || "Nao foi possivel analisar a solicitacao.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    }
  };

  const confirmarAnaliseEdicao = (edicao, acao) => {
    const detalhes = obterResumoEdicao(edicao, auxiliares).map((item) => ({
      label: item.label,
      valor: `${item.antes} -> ${item.depois}`,
    }));

    setPopup({
      aberto: true,
      tipo: "confirmacao",
      titulo: acao === "aprovar" ? "Aprovar solicitacao de edicao?" : "Rejeitar solicitacao de edicao?",
      mensagem: `Filme: ${edicao.filme?.titulo || "Nao informado"}`,
      detalhes,
      textoConfirmar: acao === "aprovar" ? "Aprovar" : "Rejeitar",
      textoCancelar: "Cancelar",
      onCancelar: fecharPopup,
      onConfirmar: () => analisarEdicao(edicao, acao),
    });
  };

  if (carregando) return <div className="admin-loading">Carregando gerenciamento...</div>;

  return (
    <div className="pagina-admin">
      <div className="admin-container">
        <h1 className="admin-titulo-secao">Gerenciamento</h1>

        <div className="admin-resumo-grid">
          <div className="admin-card-resumo">
            <Film size={32} color="#e03c2f" />
            <h2>{filmes.length}</h2>
            <p>Total de Filmes</p>
          </div>

          <div className="admin-card-resumo">
            <Clock size={32} color="#eab308" />
            <h2>{pendentes.length}</h2>
            <p>Filmes Pendentes</p>
          </div>

          <div className="admin-card-resumo">
            <Pencil size={32} color="#3b82f6" />
            <h2>{edicoesPendentes.length}</h2>
            <p>Edicoes Pendentes</p>
          </div>
        </div>

        <h2 className="admin-titulo-secao">Filmes Pendentes</h2>
        <div className="admin-lista-vertical">
          {pendentes.length === 0 ? <p className="admin-vazio">Nenhum filme pendente.</p> : null}

          {pendentes.map((filme) => (
            <div key={`pendente-${getIdFilme(filme)}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={filme.imagem || filme.poster || POSTER_PADRAO} alt={filme.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{filme.titulo}</h3>
                  <p>{filme.ano} - ID: {getIdFilme(filme)}</p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-aprovar" onClick={() => handleAprovarFilme(getIdFilme(filme))} title="Aprovar Filme">
                  <Check size={20} strokeWidth={3} />
                </button>
                <button className="btn-deletar" onClick={() => handleDeletarFilme(filme, true)} title="Excluir Filme">
                  <Trash2 size={20} color="#e03c2f" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="admin-titulo-secao">Solicitacoes de Edicao</h2>
        <div className="admin-lista-vertical">
          {edicoesPendentes.length === 0 ? <p className="admin-vazio">Nenhuma edicao pendente.</p> : null}

          {edicoesPendentes.map((edicao) => {
            const alteracoes = obterResumoEdicao(edicao, auxiliares);

            return (
              <div key={`ed-${edicao.id_solicitacao}`} className="admin-item-lista">
                <div className="admin-item-info">
                  <img src={edicao.filme?.poster || edicao.filme?.imagem || POSTER_PADRAO} alt={edicao.filme?.titulo} className="admin-item-poster" />
                  <div className="admin-textos">
                    <h3>{edicao.filme?.titulo || "Filme nao informado"}</h3>
                    <p className="admin-subtexto">
                      por {edicao.usuario?.apelido || edicao.usuario?.nome || "usuario"} {formatarData(edicao.data_criacao)}
                    </p>
                    {alteracoes.length === 0 ? (
                      <p className="admin-subtexto">Nenhuma mudanca detectada.</p>
                    ) : alteracoes.map((item) => (
                      <p key={item.campo} className="admin-subtexto admin-comparacao">
                        {item.label}: <span className="valor-antigo">{item.antes}</span> <span className="seta-comparacao">-&gt;</span> <span className="valor-novo">{item.depois}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="admin-item-acoes">
                  <button className="btn-aprovar" onClick={() => confirmarAnaliseEdicao(edicao, "aprovar")} title="Aprovar Edicao">
                    <Check size={20} strokeWidth={3} />
                  </button>
                  <button className="btn-rejeitar" onClick={() => confirmarAnaliseEdicao(edicao, "rejeitar")} title="Rejeitar Edicao">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="admin-titulo-secao">Todos os Filmes</h2>
        <div className="admin-lista-vertical">
          {filmes.length === 0 ? <p className="admin-vazio">Nenhum filme catalogado.</p> : null}

          {filmes.map((filme) => (
            <div key={`all-${getIdFilme(filme)}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={filme.imagem || filme.poster || POSTER_PADRAO} alt={filme.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{filme.titulo}</h3>
                  <p>{filme.ano} - ID: {getIdFilme(filme)}</p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-deletar" onClick={() => handleDeletarFilme(filme, false)} title="Excluir Filme">
                  <Trash2 size={20} color="#e03c2f" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
