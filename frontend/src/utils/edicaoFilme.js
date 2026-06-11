import {
  CAMPOS_EDICAO,
  CAMPOS_LISTA_EDICAO,
  criarFormularioFilme,
  formatarValorPopup,
  idDoItem,
  nomeItem,
  normalizarLista,
} from "./movieForm";

export const montarPayloadEdicaoFilme = (form) => ({
  titulo: form.titulo.trim(),
  ano: form.ano ? Number(form.ano) : null,
  duracao: form.duracao.trim() || null,
  orcamento: form.orcamento ? Number(form.orcamento) : null,
  sinopse: form.sinopse.trim() || null,
  poster: form.poster.trim() || null,
  banner: form.banner.trim() || null,
  trailer: form.trailer.trim() || null,
  ids_atores: form.ids_atores.map(Number),
  ids_categorias: form.ids_categorias.map(Number),
  ids_diretores: form.ids_diretores.map(Number),
  ids_linguagens: form.ids_linguagens.map(Number),
  ids_paises: form.ids_paises.map(Number),
  ids_produtoras: form.ids_produtoras.map(Number),
});

export const montarPayloadAlteradoFilme = (filme, form) => {
  const payload = montarPayloadEdicaoFilme(form);
  const original = criarFormularioFilme(filme);
  const alterados = {};

  CAMPOS_EDICAO.forEach(([campo]) => {
    if (String(original[campo] ?? "") !== String(form[campo] ?? "")) {
      alterados[campo] = payload[campo];
    }
  });

  CAMPOS_LISTA_EDICAO.forEach(([campo]) => {
    const antes = [...original[campo]].sort().join(",");
    const depois = [...form[campo]].sort().join(",");

    if (antes !== depois) {
      alterados[campo] = payload[campo];
    }
  });

  return alterados;
};

const formatarListaPorIds = (form, campo, itens, campoId) => {
  const idsSelecionados = form[campo];
  const nomes = itens
    .filter((item) => idsSelecionados.includes(String(idDoItem(item, campoId))))
    .map(nomeItem)
    .filter(Boolean);

  return nomes.length > 0 ? nomes.join(", ") : "Nenhum";
};

export const obterAlteracoesFilme = (filme, form, auxiliares) => {
  const original = criarFormularioFilme(filme);
  const alteracoes = [];

  CAMPOS_EDICAO.forEach(([campo, label]) => {
    if (String(original[campo] ?? "") !== String(form[campo] ?? "")) {
      alteracoes.push({
        label,
        valor: `${formatarValorPopup(original[campo])} -> ${formatarValorPopup(form[campo])}`,
      });
    }
  });

  CAMPOS_LISTA_EDICAO.forEach(([campo, label, chaveAuxiliar, campoId]) => {
    const antes = [...original[campo]].sort().join(",");
    const depois = [...form[campo]].sort().join(",");

    if (antes !== depois) {
      const nomesAntes = normalizarLista(filme?.[chaveAuxiliar]).map(nomeItem).filter(Boolean);
      alteracoes.push({
        label,
        valor: `${nomesAntes.length > 0 ? nomesAntes.join(", ") : "Nenhum"} -> ${formatarListaPorIds(form, campo, auxiliares[chaveAuxiliar], campoId)}`,
      });
    }
  });

  return alteracoes;
};
