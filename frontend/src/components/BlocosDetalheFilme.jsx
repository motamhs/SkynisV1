import { Heart, Pencil, Send, Star, User } from "lucide-react";
import { formatarDuracao, formatarLista, formatarOrcamento, nomeItem } from "../utils/movieForm";

export function CabecalhoFilme({
  filme,
  categorias,
  admin,
  favoritado,
  favoritando,
  onFavoritar,
  onEditar,
  onSolicitarEdicao,
}) {
  return (
    <>
      <h1 className="detalhes-titulo">{filme.titulo}</h1>

      <div className="detalhes-header-infos">
        <span className="detalhes-ano">{filme.ano || "Ano nao informado"}</span>
        <div className="detalhes-tags">
          {categorias.length > 0 ? (
            categorias.map((categoria, index) => (
              <span key={categoria.id_categoria || categoria.id || index} className="tag">
                {nomeItem(categoria)}
              </span>
            ))
          ) : (
            <span className="tag">Sem genero</span>
          )}
        </div>
      </div>

      <p className="detalhes-sinopse">
        {filme.sinopse || "Sinopse nao disponivel para este filme."}
      </p>

      <div className="detalhes-botoes-acao">
        <button className={`btn-favoritado${favoritado ? " ativo" : ""}`} onClick={onFavoritar} disabled={favoritando}>
          <Heart size={18} fill={favoritado ? "currentColor" : "none"} />
          {favoritando ? "Salvando..." : favoritado ? "Favoritado" : "Favoritar"}
        </button>
        {admin ? (
          <button className="btn-solicitar-edicao" onClick={onEditar}>
            <Pencil size={18} />
            Editar Filme
          </button>
        ) : (
          <button className="btn-solicitar-edicao" onClick={onSolicitarEdicao}>
            <Send size={18} />
            Solicitar Edicao
          </button>
        )}
      </div>
    </>
  );
}

export function AvaliacaoFilme({ avaliacao, salvando, onAvaliar }) {
  return (
    <section className="secao-avaliacao">
      <div className="avaliacao-resumo">
        <span className="avaliacao-label">Avaliacao dos usuarios</span>
        <strong>{Number(avaliacao.media || 0).toFixed(1)}</strong>
        <span>{avaliacao.total} {avaliacao.total === 1 ? "voto" : "votos"}</span>
      </div>

      <div className="avaliacao-voto">
        <span>Sua nota</span>
        <button
          type="button"
          className={`btn-nota-zero${avaliacao.nota_usuario === 0 ? " ativo" : ""}`}
          onClick={() => onAvaliar(0)}
          disabled={salvando}
          title="Dar 0 estrelas"
        >
          0
        </button>
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            type="button"
            className={`btn-estrela${Number(avaliacao.nota_usuario) >= nota ? " ativa" : ""}`}
            onClick={() => onAvaliar(nota)}
            disabled={salvando}
            title={`${nota} ${nota === 1 ? "estrela" : "estrelas"}`}
          >
            <Star size={22} fill={Number(avaliacao.nota_usuario) >= nota ? "currentColor" : "none"} />
          </button>
        ))}
        <small>
          {avaliacao.nota_usuario === null || avaliacao.nota_usuario === undefined
            ? "Voce ainda nao avaliou"
            : `Voce avaliou com ${avaliacao.nota_usuario}`}
        </small>
      </div>
    </section>
  );
}

export function MetadadosFilme({ filme, paises }) {
  const itens = [
    ["DIRETOR", formatarLista(filme.diretores)],
    ["DURACAO", formatarDuracao(filme.duracao)],
    ["PRODUTORA", formatarLista(filme.produtoras)],
    ["ORCAMENTO", formatarOrcamento(filme.orcamento)],
    ["PAIS", formatarLista(paises)],
    ["IDIOMA", formatarLista(filme.linguagens)],
  ];

  return (
    <div className="grid-metadados">
      {itens.map(([label, valor]) => (
        <div key={label} className="card-meta">
          <span className="meta-label">{label}</span>
          <span className="meta-valor">{valor}</span>
        </div>
      ))}
    </div>
  );
}

export function TrailerFilme({ titulo, trailerEmbed }) {
  if (!trailerEmbed) return null;

  return (
    <section className="secao-trailer">
      <h2>Trailer</h2>
      <div className="trailer-container">
        <iframe
          src={trailerEmbed}
          title={`Trailer de ${titulo}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  );
}

export function ElencoFilme({ atores }) {
  return (
    <div className="secao-elenco">
      <h2>Elenco</h2>
      <div className="lista-elenco">
        {atores.length > 0 ? (
          atores.map((ator, index) => (
            <div key={ator.id_ator || ator.id || index} className="ator-card">
              <div className="ator-avatar">
                {ator.foto ? <img src={ator.foto} alt={nomeItem(ator)} /> : <User size={32} color="#666" />}
              </div>
              <span className="ator-nome">{nomeItem(ator)}</span>
            </div>
          ))
        ) : (
          <p className="elenco-vazio">Elenco nao informado.</p>
        )}
      </div>
    </div>
  );
}
