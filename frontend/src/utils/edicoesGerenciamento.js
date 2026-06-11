import { idDoItem, nomeItem } from "./movieForm";

export const pegarIdFilme = (filme) => filme?.id || filme?.id_filme;

export const formatarData = (valor) => {
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

export const obterResumoEdicao = (edicao, auxiliares) =>
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
