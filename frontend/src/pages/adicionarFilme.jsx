import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import Popup from "../components/popup";
import "./css/adicionarFilme.css";

const API_URL = "http://localhost:8000";
const AUXILIARES_VAZIOS = {
  atores: [],
  categorias: [],
  diretores: [],
  linguagens: [],
  paises: [],
  produtoras: [],
};

const FORM_INICIAL = {
  titulo: "",
  ano: "",
  duracao: "",
  orcamento: "",
  sinopse: "",
  poster: "",
  banner: "",
  trailer: "",
  ids_atores: [],
  ids_categorias: [],
  ids_diretores: [],
  ids_linguagens: [],
  ids_paises: [],
  ids_produtoras: [],
};

const idDoItem = (item, campo) => item?.id ?? item?.[campo];

const nomeItem = (item) => [item?.nome, item?.sobrenome].filter(Boolean).join(" ");

const usuarioEhAdmin = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return payloadJson.role === "admin";
  } catch {
    return false;
  }
};

export default function AdicionarFilme() {
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_INICIAL);
  const [auxiliares, setAuxiliares] = useState(AUXILIARES_VAZIOS);
  const [buscas, setBuscas] = useState({});
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
        const [
          respAtores,
          respCategorias,
          respDiretores,
          respLinguagens,
          respPaises,
          respProdutoras,
        ] = await Promise.all([
          fetch(`${API_URL}/dados/atores`),
          fetch(`${API_URL}/dados/categorias`),
          fetch(`${API_URL}/dados/diretores`),
          fetch(`${API_URL}/dados/linguagens`),
          fetch(`${API_URL}/dados/paises`),
          fetch(`${API_URL}/dados/produtoras`),
        ]);

        setAuxiliares({
          atores: respAtores.ok ? await respAtores.json() : [],
          categorias: respCategorias.ok ? await respCategorias.json() : [],
          diretores: respDiretores.ok ? await respDiretores.json() : [],
          linguagens: respLinguagens.ok ? await respLinguagens.json() : [],
          paises: respPaises.ok ? await respPaises.json() : [],
          produtoras: respProdutoras.ok ? await respProdutoras.json() : [],
        });
      } catch (erro) {
        console.error("Erro ao buscar dados auxiliares:", erro);
      }
    };

    buscarAuxiliares();
  }, [navigate]);

  const atualizarCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const atualizarBusca = (campo, valor) => {
    setBuscas((atual) => ({ ...atual, [campo]: valor }));
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

  const salvarFilme = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

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
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
        mensagem: admin
          ? `"${filmeCriado.titulo}" foi adicionado ao catalogo.`
          : `"${filmeCriado.titulo}" foi enviado para um administrador aprovar.`,
        textoConfirmar: admin ? "Ver filme" : "Fechar",
        onFechar: () => admin ? navigate(`/filme/${filmeCriado.id_filme}`) : navigate("/filmes"),
      });
    } catch (erro) {
      console.error("Erro ao salvar filme:", erro);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao salvar filme",
        mensagem: erro.message || "Erro ao salvar filme.",
        textoConfirmar: "Fechar",
        onFechar: () => setPopup({ aberto: false }),
      });
    } finally {
      setSalvando(false);
    }
  };

  const renderizarSeletorMultiplo = (label, campo, itens, campoId, obrigatorio = false) => {
    const termoBusca = buscas[campo] || "";
    const selecionados = form[campo];
    const itensSelecionados = itens.filter((item) =>
      selecionados.includes(String(idDoItem(item, campoId)))
    );
    const itensFiltrados = itens.filter((item) =>
      nomeItem(item).toLowerCase().includes(termoBusca.toLowerCase())
    );

    return (
      <div className="grupo-adicionar seletor-adicionar">
        <span>{label}{obrigatorio ? " *" : ""}</span>

        <input
          value={termoBusca}
          onChange={(event) => atualizarBusca(campo, event.target.value)}
          placeholder={`Buscar ${label.toLowerCase()}`}
        />

        <div className="chips-adicionar">
          {itensSelecionados.length > 0 ? (
            itensSelecionados.map((item) => {
              const itemId = idDoItem(item, campoId);
              return (
                <button
                  key={itemId}
                  type="button"
                  className="chip-adicionar"
                  onClick={() => removerItemLista(campo, itemId)}
                >
                  {nomeItem(item)}
                  <X size={14} />
                </button>
              );
            })
          ) : (
            <small>Nenhum selecionado</small>
          )}
        </div>

        <div className="lista-adicionar">
          {itensFiltrados.length > 0 ? (
            itensFiltrados.map((item) => {
              const itemId = idDoItem(item, campoId);
              const selecionado = selecionados.includes(String(itemId));

              return (
                <button
                  key={itemId}
                  type="button"
                  className={`opcao-adicionar${selecionado ? " selecionada" : ""}`}
                  onClick={() => alternarItemLista(campo, itemId)}
                >
                  <span className="checkbox-adicionar">{selecionado ? "✓" : ""}</span>
                  <span>{nomeItem(item)}</span>
                </button>
              );
            })
          ) : (
            <p className="sem-opcoes-adicionar">Nenhum resultado.</p>
          )}
        </div>
      </div>
    );
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

          {renderizarSeletorMultiplo("Generos", "ids_categorias", auxiliares.categorias, "id_categoria", true)}
          {renderizarSeletorMultiplo("Diretores", "ids_diretores", auxiliares.diretores, "id_diretor", true)}
          {renderizarSeletorMultiplo("Atores", "ids_atores", auxiliares.atores, "id_ator", true)}
          {renderizarSeletorMultiplo("Produtoras", "ids_produtoras", auxiliares.produtoras, "id_produtora", true)}
          {renderizarSeletorMultiplo("Paises", "ids_paises", auxiliares.paises, "id_pais", true)}
          {renderizarSeletorMultiplo("Idiomas", "ids_linguagens", auxiliares.linguagens, "id_linguagem", true)}

          <button type="submit" className="btn-salvar-filme" disabled={salvando}>
            <Save size={18} />
            {salvando ? "Salvando..." : usuarioEhAdmin() ? "Salvar Filme" : "Enviar para aprovacao"}
          </button>
        </form>
      </div>

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
