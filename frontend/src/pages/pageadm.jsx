import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../components/popup";
import { ResumoGerenciamento, SecaoEdicoes, SecaoFilmes } from "../components/Gerenciamento";
import { pegarIdFilme, obterResumoEdicao } from "../utils/edicoesGerenciamento";
import { AUXILIARES_VAZIOS } from "../utils/movieForm";
import "./css/pageadm.css";

const API_URL = "http://localhost:8000";

export default function Gerenciamento() {
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

    Promise.resolve().then(buscarDadosAdmin);
  }, [token, navigate, usuarioEhAdmin, buscarDadosAdmin]);

  const handleAprovarFilme = async (idFilme) => {
    try {
      const resp = await fetch(`${API_URL}/filmes/${idFilme}/aprovar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!resp.ok) throw new Error("Nao foi possivel aprovar o filme.");

      const filmeAprovado = pendentes.find((filme) => pegarIdFilme(filme) === idFilme);
      setPendentes((atuais) => atuais.filter((filme) => pegarIdFilme(filme) !== idFilme));
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
        setPendentes((atuais) => atuais.filter((filme) => pegarIdFilme(filme) !== idFilme));
      } else {
        setFilmes((atuais) => atuais.filter((filme) => pegarIdFilme(filme) !== idFilme));
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
    const idFilme = pegarIdFilme(filme);

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

        <ResumoGerenciamento
          totalFilmes={filmes.length}
          totalPendentes={pendentes.length}
          totalEdicoes={edicoesPendentes.length}
        />

        <SecaoFilmes
          titulo="Filmes Pendentes"
          vazio="Nenhum filme pendente."
          filmes={pendentes}
          pendente
          onAprovar={handleAprovarFilme}
          onExcluir={handleDeletarFilme}
        />

        <SecaoEdicoes
          edicoes={edicoesPendentes}
          auxiliares={auxiliares}
          onAnalisar={confirmarAnaliseEdicao}
        />

        <SecaoFilmes
          titulo="Todos os Filmes"
          vazio="Nenhum filme catalogado."
          filmes={filmes}
          onExcluir={handleDeletarFilme}
        />
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
