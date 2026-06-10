import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Popup from "../components/popup";
import SeletorMultiploCriavel from "../components/SeletorMultiploCriavel";
import {
  API_URL,
  AUXILIARES_VAZIOS,
  CONFIG_CRIACAO_AUXILIAR,
  FORM_FILME_INICIAL,
  idDoItem,
  montarPayloadAuxiliar,
  usuarioEhAdmin,
} from "../utils/movieForm";
import "./css/adicionarFilme.css";

const SELETORES = [
  ["Generos", "ids_categorias", "categorias", "id_categoria"],
  ["Diretores", "ids_diretores", "diretores", "id_diretor"],
  ["Atores", "ids_atores", "atores", "id_ator"],
  ["Produtoras", "ids_produtoras", "produtoras", "id_produtora"],
  ["Paises", "ids_paises", "paises", "id_pais"],
  ["Idiomas", "ids_linguagens", "linguagens", "id_linguagem"],
];

export default function AdicionarFilme() {
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_FILME_INICIAL);
  const [auxiliares, setAuxiliares] = useState(AUXILIARES_VAZIOS);
  const [buscas, setBuscas] = useState({});
  const [novosAuxiliares, setNovosAuxiliares] = useState({});
  const [criacaoAberta, setCriacaoAberta] = useState({});
  const [criandoAuxiliar, setCriandoAuxiliar] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [popup, setPopup] = useState({ aberto: false });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarAuxiliares = async () => {
      try {
        const respostas = await Promise.all([
          fetch(`${API_URL}/dados/atores`),
          fetch(`${API_URL}/dados/categorias`),
          fetch(`${API_URL}/dados/diretores`),
          fetch(`${API_URL}/dados/linguagens`),
          fetch(`${API_URL}/dados/paises`),
          fetch(`${API_URL}/dados/produtoras`),
        ]);

        const [atores, categorias, diretores, linguagens, paises, produtoras] = await Promise.all(
          respostas.map((resposta) => resposta.ok ? resposta.json() : [])
        );
        setAuxiliares({ atores, categorias, diretores, linguagens, paises, produtoras });
      } catch (erro) {
        console.error("Erro ao buscar dados auxiliares:", erro);
      }
    };

    buscarAuxiliares();
  }, [navigate]);

  const atualizarCampo = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }));
  const atualizarBusca = (campo, valor) => setBuscas((atual) => ({ ...atual, [campo]: valor }));
  const alternarCriacaoAuxiliar = (campo) => setCriacaoAberta((atual) => ({ ...atual, [campo]: !atual[campo] }));

  const atualizarNovoAuxiliar = (campo, subcampo, valor) => {
    setNovosAuxiliares((atual) => ({
      ...atual,
      [campo]: { nome: "", sobrenome: "", foto: "", ...(atual[campo] || {}), [subcampo]: valor },
    }));
  };

  const alternarItemLista = (campo, itemId) => {
    const idTexto = String(itemId);
    setForm((atual) => ({
      ...atual,
      [campo]: atual[campo].includes(idTexto)
        ? atual[campo].filter((idSelecionado) => idSelecionado !== idTexto)
        : [...atual[campo], idTexto],
    }));
  };

  const removerItemLista = (campo, itemId) => {
    const idTexto = String(itemId);
    setForm((atual) => ({ ...atual, [campo]: atual[campo].filter((idSelecionado) => idSelecionado !== idTexto) }));
  };

  const criarItemAuxiliar = async (campo) => {
    const config = CONFIG_CRIACAO_AUXILIAR[campo];
    const dados = { nome: "", sobrenome: "", foto: "", ...(novosAuxiliares[campo] || {}) };
    const token = localStorage.getItem("access_token");
    if (!config || !dados.nome.trim() || !token) return;

    try {
      setCriandoAuxiliar((atual) => ({ ...atual, [campo]: true }));
      const resposta = await fetch(`${API_URL}/dados/${config.endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(montarPayloadAuxiliar(dados, config.tipo)),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao criar item.");
      }

      const novoItem = await resposta.json();
      const novoId = idDoItem(novoItem, config.campoId);
      setAuxiliares((atual) => ({
        ...atual,
        [config.chave]: atual[config.chave].some((item) => String(idDoItem(item, config.campoId)) === String(novoId))
          ? atual[config.chave]
          : [...atual[config.chave], novoItem],
      }));
      setForm((atual) => ({ ...atual, [campo]: atual[campo].includes(String(novoId)) ? atual[campo] : [...atual[campo], String(novoId)] }));
      setBuscas((atual) => ({ ...atual, [campo]: "" }));
      setCriacaoAberta((atual) => ({ ...atual, [campo]: false }));
      setNovosAuxiliares((atual) => ({ ...atual, [campo]: { nome: "", sobrenome: "", foto: "" } }));
    } catch (erro) {
      setPopup({ aberto: true, tipo: "erro", titulo: "Erro ao criar item", mensagem: erro.message, textoConfirmar: "Fechar", onFechar: () => setPopup({ aberto: false }) });
    } finally {
      setCriandoAuxiliar((atual) => ({ ...atual, [campo]: false }));
    }
  };

  const salvarFilme = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return navigate("/login");

    const payload = {
      titulo: form.titulo.trim(),
      ano: form.ano ? Number(form.ano) : null,
      duracao: form.duracao.trim() || null,
      orcamento: form.orcamento ? Number(form.orcamento) : null,
      sinopse: form.sinopse.trim() || null,
      poster: form.poster.trim() || null,
      banner: form.banner.trim() || null,
      trailer: form.trailer.trim() || null,
      id_produtora_principal: form.ids_produtoras[0] ? Number(form.ids_produtoras[0]) : null,
      ids_atores: form.ids_atores.map(Number),
      ids_categorias: form.ids_categorias.map(Number),
      ids_diretores: form.ids_diretores.map(Number),
      ids_linguagens: form.ids_linguagens.map(Number),
      ids_paises: form.ids_paises.map(Number),
      ids_produtoras: form.ids_produtoras.map(Number),
    };

    try {
      setSalvando(true);
      const resposta = await fetch(`${API_URL}/filmes`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resposta.ok) {
        const erroResposta = await resposta.json().catch(() => null);
        throw new Error(erroResposta?.detail || "Erro ao salvar filme.");
      }

      const filmeCriado = await resposta.json();
      const admin = usuarioEhAdmin();
      setPopup({
        aberto: true,
        tipo: "sucesso",
        titulo: admin ? "Filme salvo com sucesso" : "Filme enviado para aprovacao",
        mensagem: admin ? `"${filmeCriado.titulo}" foi adicionado ao catalogo.` : `"${filmeCriado.titulo}" foi enviado para um administrador aprovar.`,
        textoConfirmar: admin ? "Ver filme" : "Fechar",
        onFechar: () => admin ? navigate(`/filme/${filmeCriado.id_filme}`) : navigate("/filmes"),
      });
    } catch (erro) {
      setPopup({ aberto: true, tipo: "erro", titulo: "Erro ao salvar filme", mensagem: erro.message, textoConfirmar: "Fechar", onFechar: () => setPopup({ aberto: false }) });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pagina-adicionar-filme">
      <div className="adicionar-container">
        <button className="btn-voltar-adicionar" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="cabecalho-adicionar">
          <h1>Adicionar Filme</h1>
          <p>{usuarioEhAdmin() ? "Publique diretamente no catalogo" : "Envie para aprovacao de um administrador"}</p>
        </div>

        <form className="form-adicionar-filme" onSubmit={salvarFilme}>
          <label className="grupo-adicionar grupo-adicionar-largo">
            <span>Titulo *</span>
            <input value={form.titulo} onChange={(event) => atualizarCampo("titulo", event.target.value)} placeholder="Nome do filme" required />
          </label>
          <label className="grupo-adicionar">
            <span>Ano *</span>
            <input type="number" value={form.ano} onChange={(event) => atualizarCampo("ano", event.target.value)} placeholder="2024" required />
          </label>
          <label className="grupo-adicionar">
            <span>Duracao *</span>
            <input value={form.duracao} onChange={(event) => atualizarCampo("duracao", event.target.value)} placeholder="2:12:00" required />
          </label>
          <label className="grupo-adicionar">
            <span>Orcamento *</span>
            <input type="number" value={form.orcamento} onChange={(event) => atualizarCampo("orcamento", event.target.value)} placeholder="100000000" required />
          </label>
          <label className="grupo-adicionar grupo-adicionar-largo">
            <span>URL do Poster *</span>
            <input value={form.poster} onChange={(event) => atualizarCampo("poster", event.target.value)} placeholder="https://..." required />
          </label>
          <label className="grupo-adicionar grupo-adicionar-largo">
            <span>URL do Banner</span>
            <input value={form.banner} onChange={(event) => atualizarCampo("banner", event.target.value)} placeholder="https://..." />
          </label>
          <label className="grupo-adicionar grupo-adicionar-largo">
            <span>URL do Trailer</span>
            <input value={form.trailer} onChange={(event) => atualizarCampo("trailer", event.target.value)} placeholder="https://..." />
          </label>
          <label className="grupo-adicionar grupo-adicionar-largo">
            <span>Sinopse *</span>
            <textarea value={form.sinopse} onChange={(event) => atualizarCampo("sinopse", event.target.value)} placeholder="Resumo do filme..." rows={6} required />
          </label>

          {SELETORES.map(([label, campo, chave, campoId]) => (
            <SeletorMultiploCriavel
              key={campo}
              label={label}
              campo={campo}
              itens={auxiliares[chave]}
              campoId={campoId}
              obrigatorio
              selecionados={form[campo]}
              busca={buscas[campo]}
              novo={novosAuxiliares[campo]}
              criacaoAberta={criacaoAberta[campo]}
              criando={criandoAuxiliar[campo]}
              onBusca={atualizarBusca}
              onToggleItem={alternarItemLista}
              onRemoverItem={removerItemLista}
              onToggleCriacao={alternarCriacaoAuxiliar}
              onNovoChange={atualizarNovoAuxiliar}
              onCriar={criarItemAuxiliar}
            />
          ))}

          <button type="submit" className="btn-salvar-filme" disabled={salvando}>
            <Save size={18} />
            {salvando ? "Salvando..." : usuarioEhAdmin() ? "Salvar Filme" : "Enviar para aprovacao"}
          </button>
        </form>
      </div>

      <Popup {...popup} />
    </div>
  );
}
