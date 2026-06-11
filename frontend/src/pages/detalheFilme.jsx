import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  AvaliacaoFilme,
  CabecalhoFilme,
  ElencoFilme,
  MetadadosFilme,
  TrailerFilme,
} from "../components/BlocosDetalheFilme";
import ModalEdicaoFilme from "../components/ModalEdicaoFilme";
import Popup from "../components/popup";
import {
  API_URL,
  AUXILIARES_VAZIOS,
  CONFIG_CRIACAO_AUXILIAR,
  criarFormularioFilme,
  idDoItem,
  montarPayloadAuxiliar,
  normalizarLista,
  obterUrlTrailerEmbed,
  usuarioEhAdmin,
} from "../utils/movieForm";
import {
  AVALIACAO_VAZIA,
  buscarAvaliacaoDoFilme,
  buscarDadosAuxiliaresFilme,
  buscarFavoritoDoFilme,
  buscarFilmePorId,
} from "../utils/dadosFilme";
import { montarPayloadAlteradoFilme, montarPayloadEdicaoFilme, obterAlteracoesFilme } from "../utils/edicaoFilme";
import "./css/detalheFilme.css";

const POSTER_PADRAO = "https://placehold.co/500x750/111111/e03c2f?text=Sem+Poster";

export default function FilmeDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filme, setFilme] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [favoritado, setFavoritado] = useState(false);
  const [favoritando, setFavoritando] = useState(false);
  const [avaliacao, setAvaliacao] = useState(AVALIACAO_VAZIA);
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [form, setForm] = useState(criarFormularioFilme(null));
  const [auxiliares, setAuxiliares] = useState(AUXILIARES_VAZIOS);
  const [buscas, setBuscas] = useState({});
  const [novosAuxiliares, setNovosAuxiliares] = useState({});
  const [criacaoAberta, setCriacaoAberta] = useState({});
  const [criandoAuxiliar, setCriandoAuxiliar] = useState({});
  const [popup, setPopup] = useState({ aberto: false });
  const admin = usuarioEhAdmin();

  useEffect(() => {
    const buscarDetalhes = async () => {
      if (!id) {
        setErro("ID do filme nao informado.");
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const dados = await buscarFilmePorId(id);
        setFilme(dados);
        setForm(criarFormularioFilme(dados));

        const token = localStorage.getItem("access_token");
        const filmeId = dados.id || dados.id_filme;
        setFavoritado(await buscarFavoritoDoFilme(filmeId, token));
        setAvaliacao(await buscarAvaliacaoDoFilme(filmeId, token));
      } catch (erroBusca) {
        console.error("Erro ao buscar filme:", erroBusca);
        setFilme(null);
        setErro(erroBusca.message || "Erro ao buscar filme.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDetalhes();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const buscarAuxiliares = async () => {
      try {
        setAuxiliares(await buscarDadosAuxiliaresFilme());
      } catch (erroAuxiliares) {
        console.error("Erro ao buscar dados auxiliares:", erroAuxiliares);
      }
    };

    buscarAuxiliares();
  }, []);

  useEffect(() => {
    if (!editando) return undefined;

    const overflowOriginal = document.body.style.overflow;
    const fecharComEscape = (event) => {
      if (event.key === "Escape" && !salvando) {
        setForm(criarFormularioFilme(filme));
        setBuscas({});
        setCriacaoAberta({});
        setNovosAuxiliares({});
        setEditando(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [editando, salvando, filme]);

  const atualizarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const alternarItemLista = (campo, itemId) => {
    const itemIdTexto = String(itemId);

    setForm((atual) => {
      const selecionados = atual[campo];
      const proximaLista = selecionados.includes(itemIdTexto)
        ? selecionados.filter((idSelecionado) => idSelecionado !== itemIdTexto)
        : [...selecionados, itemIdTexto];

      return { ...atual, [campo]: proximaLista };
    });
  };

  const removerItemLista = (campo, itemId) => {
    const itemIdTexto = String(itemId);

    setForm((atual) => ({
      ...atual,
      [campo]: atual[campo].filter((idSelecionado) => idSelecionado !== itemIdTexto),
    }));
  };

  const atualizarBusca = (campo, valor) => {
    setBuscas((atual) => ({ ...atual, [campo]: valor }));
  };

  const atualizarNovoAuxiliar = (campo, subcampo, valor) => {
    setNovosAuxiliares((atual) => ({
      ...atual,
      [campo]: {
        nome: "",
        sobrenome: "",
        foto: "",
        ...(atual[campo] || {}),
        [subcampo]: valor,
      },
    }));
  };

  const alternarCriacaoAuxiliar = (campo) => {
    setCriacaoAberta((atual) => ({ ...atual, [campo]: !atual[campo] }));
  };

  const criarItemAuxiliar = async (campo) => {
    const config = CONFIG_CRIACAO_AUXILIAR[campo];
    const dadosCriacao = {
      nome: "",
      sobrenome: "",
      foto: "",
      ...(novosAuxiliares[campo] || {}),
    };
    const nomeInformado = dadosCriacao.nome.trim();
    const token = localStorage.getItem("access_token");

    if (!config || !nomeInformado || !token) return;

    try {
      setCriandoAuxiliar((atual) => ({ ...atual, [campo]: true }));

      const resposta = await fetch(`${API_URL}/dados/${config.endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(montarPayloadAuxiliar({ ...dadosCriacao, nome: nomeInformado }, config.tipo)),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao criar item.");
      }

      const novoItem = await resposta.json();
      const novoId = idDoItem(novoItem, config.campoId);

      setAuxiliares((atual) => {
        const listaAtual = atual[config.chave] || [];
        const jaExiste = listaAtual.some((item) => String(idDoItem(item, config.campoId)) === String(novoId));

        return {
          ...atual,
          [config.chave]: jaExiste ? listaAtual : [...listaAtual, novoItem],
        };
      });

      setForm((atual) => ({
        ...atual,
        [campo]: atual[campo].includes(String(novoId)) ? atual[campo] : [...atual[campo], String(novoId)],
      }));
      setBuscas((atual) => ({ ...atual, [campo]: "" }));
      setCriacaoAberta((atual) => ({ ...atual, [campo]: false }));
      setNovosAuxiliares((atual) => ({
        ...atual,
        [campo]: { nome: "", sobrenome: "", foto: "" },
      }));
    } catch (erroCriacao) {
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao criar item",
        mensagem: erroCriacao.message || "Nao foi possivel criar este item.",
        textoConfirmar: "Fechar",
        onFechar: () => setPopup({ aberto: false }),
      });
    } finally {
      setCriandoAuxiliar((atual) => ({ ...atual, [campo]: false }));
    }
  };

  const abrirEdicao = () => {
    setForm(criarFormularioFilme(filme));
    setBuscas({});
    setCriacaoAberta({});
    setNovosAuxiliares({});
    setEditando(true);
  };

  const abrirSolicitacaoEdicao = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    abrirEdicao();
  };

  const cancelarEdicao = () => {
    setForm(criarFormularioFilme(filme));
    setBuscas({});
    setCriacaoAberta({});
    setNovosAuxiliares({});
    setEditando(false);
  };

  const solicitarConfirmacaoEdicao = (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const alteracoes = obterAlteracoesFilme(filme, form, auxiliares);

    if (alteracoes.length === 0) {
      setPopup({
        aberto: true,
        tipo: "info",
        titulo: "Nada para atualizar",
        mensagem: "Nenhum campo foi alterado neste filme.",
        textoConfirmar: "Entendi",
        onFechar: () => setPopup({ aberto: false }),
      });
      return;
    }

    setPopup({
      aberto: true,
      tipo: "confirmacao",
      titulo: admin ? "Deseja realmente atualizar este filme?" : "Deseja enviar esta solicitacao de edicao?",
      mensagem: "Confira as mudanças antes de salvar.",
      detalhes: alteracoes,
      textoConfirmar: admin ? "Atualizar" : "Enviar",
      textoCancelar: "Voltar",
      onCancelar: () => setPopup({ aberto: false }),
      onConfirmar: () => salvarEdicao(admin ? montarPayloadEdicaoFilme(form) : montarPayloadAlteradoFilme(filme, form), alteracoes),
    });
  };

  const salvarEdicao = async (payload, alteracoes) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSalvando(true);
      setPopup((atual) => ({ ...atual, carregando: true }));

      const resposta = await fetch(admin ? `${API_URL}/filmes/${id}` : `${API_URL}/filmes/${id}/solicitar-edicao`, {
        method: admin ? "PATCH" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(admin ? payload : { dados: payload }),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao atualizar filme.");
      }

      const dadosResposta = await resposta.json();
      if (admin) {
        setFilme(dadosResposta);
        setForm(criarFormularioFilme(dadosResposta));
      } else {
        setForm(criarFormularioFilme(filme));
      }
      setEditando(false);
      setPopup({
        aberto: true,
        tipo: "sucesso",
        titulo: admin ? "Atualizacao feita com sucesso" : "Solicitacao enviada",
        mensagem: admin ? "O filme foi atualizado no catalogo." : "Sua edicao foi enviada para um administrador aprovar.",
        detalhes: alteracoes,
        textoConfirmar: "Fechar",
        onFechar: () => setPopup({ aberto: false }),
      });
    } catch (erroSalvar) {
      console.error("Erro ao atualizar filme:", erroSalvar);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao atualizar filme",
        mensagem: erroSalvar.message || "Erro ao atualizar filme.",
        textoConfirmar: "Fechar",
        onFechar: () => setPopup({ aberto: false }),
      });
    } finally {
      setSalvando(false);
    }
  };

  const alternarFavorito = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const filmeId = filme.id || filme.id_filme;
    if (!filmeId || favoritando) return;

    try {
      setFavoritando(true);

      const resposta = await fetch(`${API_URL}/favoritos/${filmeId}`, {
        method: favoritado ? "DELETE" : "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao atualizar favorito.");
      }

      setFavoritado((atual) => !atual);
    } catch (erroFavorito) {
      console.error("Erro ao atualizar favorito:", erroFavorito);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao atualizar favorito",
        mensagem: erroFavorito.message || "Erro ao atualizar favorito.",
        textoConfirmar: "Fechar",
        onFechar: () => setPopup({ aberto: false }),
      });
    } finally {
      setFavoritando(false);
    }
  };

  const salvarAvaliacao = async (nota) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const filmeId = filme.id || filme.id_filme;
    if (!filmeId || salvandoAvaliacao) return;

    try {
      setSalvandoAvaliacao(true);

      const resposta = await fetch(`${API_URL}/filmes/${filmeId}/avaliacao`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nota }),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao salvar avaliacao.");
      }

      setAvaliacao(await resposta.json());
    } catch (erroAvaliacao) {
      console.error("Erro ao salvar avaliacao:", erroAvaliacao);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao salvar avaliacao",
        mensagem: erroAvaliacao.message || "Erro ao salvar avaliacao.",
        textoConfirmar: "Fechar",
        onFechar: () => setPopup({ aberto: false }),
      });
    } finally {
      setSalvandoAvaliacao(false);
    }
  };

  if (carregando) {
    return <div className="carregando-detalhes">Carregando detalhes...</div>;
  }

  if (!filme) {
    return (
      <div className="filme-nao-encontrado">
        <h2>{erro || "Filme nao encontrado."}</h2>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  const categorias = normalizarLista(filme.categorias);
  const atores = normalizarLista(filme.atores);
  const poster = filme.poster || filme.imagem || POSTER_PADRAO;
  const paises = filme.paises?.length ? filme.paises : filme.pais_origem ? [filme.pais_origem] : [];
  const trailerEmbed = obterUrlTrailerEmbed(filme.trailer);

  return (
    <div className="pagina-filme-detalhes">
      <div className="detalhes-container-interno">
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="conteudo-principal-detalhes">
          <div className="area-poster">
            <img src={poster} alt={filme.titulo} className="poster-grande" />
          </div>

          <div className="area-infos">
            <CabecalhoFilme
              filme={filme}
              categorias={categorias}
              admin={admin}
              favoritado={favoritado}
              favoritando={favoritando}
              onFavoritar={alternarFavorito}
              onEditar={abrirEdicao}
              onSolicitarEdicao={abrirSolicitacaoEdicao}
            />

            <AvaliacaoFilme
              avaliacao={avaliacao}
              salvando={salvandoAvaliacao}
              onAvaliar={salvarAvaliacao}
            />

            {editando && (
              <ModalEdicaoFilme
                admin={admin}
                form={form}
                auxiliares={auxiliares}
                buscas={buscas}
                novosAuxiliares={novosAuxiliares}
                criacaoAberta={criacaoAberta}
                criandoAuxiliar={criandoAuxiliar}
                salvando={salvando}
                onCancelar={cancelarEdicao}
                onSubmit={solicitarConfirmacaoEdicao}
                onCampo={atualizarCampo}
                onBusca={atualizarBusca}
                onToggleItem={alternarItemLista}
                onRemoverItem={removerItemLista}
                onToggleCriacao={alternarCriacaoAuxiliar}
                onNovoChange={atualizarNovoAuxiliar}
                onCriarAuxiliar={criarItemAuxiliar}
              />
            )}

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

            <MetadadosFilme filme={filme} paises={paises} />
            <TrailerFilme titulo={filme.titulo} trailerEmbed={trailerEmbed} />
            <ElencoFilme atores={atores} />
          </div>
        </div>
      </div>
    </div>
  );
}
