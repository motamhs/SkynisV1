export const API_URL = "http://localhost:8000";

export const AUXILIARES_VAZIOS = {
  atores: [],
  categorias: [],
  diretores: [],
  linguagens: [],
  paises: [],
  produtoras: [],
};

export const FORM_FILME_INICIAL = {
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

export const CONFIG_CRIACAO_AUXILIAR = {
  ids_categorias: { chave: "categorias", endpoint: "categorias", campoId: "id_categoria", tipo: "nome", titulo: "Novo genero" },
  ids_diretores: { chave: "diretores", endpoint: "diretores", campoId: "id_diretor", tipo: "pessoa", titulo: "Novo diretor" },
  ids_atores: { chave: "atores", endpoint: "atores", campoId: "id_ator", tipo: "pessoa", titulo: "Novo ator", temFoto: true },
  ids_produtoras: { chave: "produtoras", endpoint: "produtoras", campoId: "id_produtora", tipo: "nome", titulo: "Nova produtora" },
  ids_paises: { chave: "paises", endpoint: "paises", campoId: "id_pais", tipo: "nome", titulo: "Novo pais" },
  ids_linguagens: { chave: "linguagens", endpoint: "linguagens", campoId: "id_linguagem", tipo: "nome", titulo: "Novo idioma" },
};

export const CAMPOS_EDICAO = [
  ["titulo", "Titulo"],
  ["ano", "Ano"],
  ["duracao", "Duracao"],
  ["orcamento", "Orcamento"],
  ["sinopse", "Sinopse"],
  ["poster", "Poster"],
  ["banner", "Banner"],
  ["trailer", "Trailer"],
];

export const CAMPOS_LISTA_EDICAO = [
  ["ids_categorias", "Categorias", "categorias", "id_categoria"],
  ["ids_diretores", "Diretores", "diretores", "id_diretor"],
  ["ids_atores", "Atores", "atores", "id_ator"],
  ["ids_produtoras", "Produtoras", "produtoras", "id_produtora"],
  ["ids_paises", "Paises", "paises", "id_pais"],
  ["ids_linguagens", "Idiomas", "linguagens", "id_linguagem"],
];

export const idDoItem = (item, campo) => item?.id ?? item?.[campo];

export const nomeItem = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return [item.nome, item.sobrenome].filter(Boolean).join(" ");
};

export const usuarioEhAdmin = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    return payloadJson.role === "admin";
  } catch {
    return false;
  }
};

export const montarPayloadAuxiliar = (dados, tipo) => {
  const nome = dados.nome.trim();
  if (tipo === "nome") return { nome };

  return {
    nome,
    sobrenome: dados.sobrenome.trim(),
    foto: dados.foto?.trim() || null,
  };
};

export const idsDaLista = (lista, campo) =>
  (Array.isArray(lista) ? lista : [])
    .map((item) => idDoItem(item, campo))
    .filter((itemId) => itemId !== undefined && itemId !== null)
    .map(String);

export const criarFormularioFilme = (filme) => ({
  ...FORM_FILME_INICIAL,
  titulo: filme?.titulo || "",
  ano: filme?.ano ? String(filme.ano) : "",
  duracao: filme?.duracao || "",
  orcamento: filme?.orcamento ? String(filme.orcamento) : "",
  sinopse: filme?.sinopse || "",
  poster: filme?.poster || "",
  banner: filme?.banner || "",
  trailer: filme?.trailer || "",
  ids_atores: idsDaLista(filme?.atores, "id_ator"),
  ids_categorias: idsDaLista(filme?.categorias, "id_categoria"),
  ids_diretores: idsDaLista(filme?.diretores, "id_diretor"),
  ids_linguagens: idsDaLista(filme?.linguagens, "id_linguagem"),
  ids_paises: idsDaLista(filme?.paises, "id_pais"),
  ids_produtoras: idsDaLista(filme?.produtoras, "id_produtora"),
});

export const normalizarLista = (valor) => {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;

  if (typeof valor === "string") {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return valor.split(",").map((nome) => ({ nome: nome.trim() })).filter((item) => item.nome);
    }
  }

  return [];
};

export const formatarLista = (valor) => {
  const nomes = normalizarLista(valor).map(nomeItem).filter(Boolean);
  return nomes.length > 0 ? nomes.join(", ") : "Nao informado";
};

export const formatarDuracao = (valor) => {
  if (!valor) return "Nao informada";
  if (typeof valor !== "string") return String(valor);

  const [horas, minutos] = valor.split(":").map(Number);
  if (Number.isNaN(horas) || Number.isNaN(minutos)) return valor;

  if (horas > 0) return `${horas}h ${String(minutos).padStart(2, "0")}min`;
  return `${minutos}min`;
};

export const formatarOrcamento = (valor) => {
  const numero = Number(valor);
  if (!valor || Number.isNaN(numero)) return "Nao informado";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "USD" });
};

export const formatarValorPopup = (valor) => {
  if (valor === undefined || valor === null || valor === "") return "Vazio";
  const texto = String(valor);
  return texto.length > 120 ? `${texto.slice(0, 117)}...` : texto;
};

export const obterUrlTrailerEmbed = (url) => {
  if (!url) return "";

  try {
    const trailerUrl = new URL(url);
    if (trailerUrl.pathname.startsWith("/embed/")) return url;
    if (trailerUrl.hostname.includes("youtu.be")) {
      const videoId = trailerUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }
    if (trailerUrl.hostname.includes("youtube.com")) {
      const videoId = trailerUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    return url;
  } catch {
    return url;
  }
};
