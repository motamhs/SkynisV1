import { API_URL, AUXILIARES_VAZIOS } from "./movieForm";

export const AVALIACAO_VAZIA = { nota_usuario: null, media: 0, total: 0 };

export const buscarFilmePorId = async (id) => {
  const resposta = await fetch(`${API_URL}/filmes/${id}`);

  if (!resposta.ok) {
    throw new Error("Filme nao encontrado.");
  }

  return resposta.json();
};

export const buscarFavoritoDoFilme = async (filmeId, token) => {
  if (!token || !filmeId) return false;

  const resposta = await fetch(`${API_URL}/favoritos/${filmeId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!resposta.ok) return false;

  const dados = await resposta.json();
  return Boolean(dados.favoritado);
};

export const buscarAvaliacaoDoFilme = async (filmeId, token) => {
  if (!token || !filmeId) return AVALIACAO_VAZIA;

  const resposta = await fetch(`${API_URL}/filmes/${filmeId}/avaliacao`, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  return resposta.ok ? resposta.json() : AVALIACAO_VAZIA;
};

export const buscarDadosAuxiliaresFilme = async () => {
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

  return {
    atores: respAtores.ok ? await respAtores.json() : AUXILIARES_VAZIOS.atores,
    categorias: respCategorias.ok ? await respCategorias.json() : AUXILIARES_VAZIOS.categorias,
    diretores: respDiretores.ok ? await respDiretores.json() : AUXILIARES_VAZIOS.diretores,
    linguagens: respLinguagens.ok ? await respLinguagens.json() : AUXILIARES_VAZIOS.linguagens,
    paises: respPaises.ok ? await respPaises.json() : AUXILIARES_VAZIOS.paises,
    produtoras: respProdutoras.ok ? await respProdutoras.json() : AUXILIARES_VAZIOS.produtoras,
  };
};
