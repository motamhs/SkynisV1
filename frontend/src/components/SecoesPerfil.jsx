import { Heart } from "lucide-react";

const POSTER_PADRAO = "https://placehold.co/500x750/111111/e03c2f?text=Sem+Poster";

const formatarValorSolicitacao = (valor) => {
  if (Array.isArray(valor)) return valor.join(", ");
  if (valor === null || valor === undefined || valor === "") return "Vazio";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
};

const resumirSolicitacao = (dados) => {
  const alteracoes = Object.entries(dados || {}).map(([campo, valor]) => (
    `${campo}: ${formatarValorSolicitacao(valor)}`
  ));

  return alteracoes.length > 0 ? alteracoes.slice(0, 3).join(" | ") : "Sem detalhes";
};

const textoStatus = (status) => {
  if (status === "aprovada") return "Aprovada";
  if (status === "rejeitada") return "Rejeitada";
  return "Pendente";
};

const textoStatusAdicao = (status) => {
  if (status === "aprovada") return "Aprovado";
  if (status === "rejeitado" || status === "rejeitada") return "Rejeitado";
  return "Pendente";
};

const renderizarCategorias = (categoriasData) => {
  const categorias = Array.isArray(categoriasData) ? categoriasData : [];
  return categorias.slice(0, 2).map((categoria) => (
    <span key={categoria.id || categoria.id_categoria || categoria.nome} className="tag">
      {categoria.nome}
    </span>
  ));
};

function FavoritoCard({ filme, onDetalhes }) {
  const filmeId = filme.id || filme.id_filme;

  return (
    <div className="card-filme-favorito">
      <div className="poster-container">
        <img src={filme.poster || filme.imagem || POSTER_PADRAO} alt={filme.titulo} className="poster-filme" />
        <div className="icone-coracao">
          <Heart size={16} color="#e03c2f" fill="#e03c2f" />
        </div>
      </div>
      <div className="card-info">
        <h4 className="card-titulo">{filme.titulo}</h4>
        <span className="card-ano">{filme.ano}</span>
        <div className="card-tags">
          {renderizarCategorias(filme.categorias)}
        </div>
        <button className="btn-ver-detalhes-card" onClick={() => onDetalhes(filmeId)}>
          Ver detalhes
        </button>
      </div>
    </div>
  );
}

export function SecaoFavoritosPerfil({ filmes, carregando, onDetalhes }) {
  return (
    <section className="secao-perfil">
      <h3>Filmes Favoritos ({filmes.length})</h3>
      <div className="grid-favoritos">
        {carregando ? (
          <p className="favoritos-vazio">Carregando favoritos...</p>
        ) : filmes.length > 0 ? filmes.map((filme) => (
          <FavoritoCard key={`fav-${filme.id || filme.id_filme}`} filme={filme} onDetalhes={onDetalhes} />
        )) : (
          <p className="favoritos-vazio">Nenhum filme favoritado ainda.</p>
        )}
      </div>
    </section>
  );
}

function SolicitacaoCard({ solicitacao, tipo }) {
  const filme = solicitacao.filme || {};
  const filmeId = filme.id || filme.id_filme;
  const status = tipo === "adicao" ? textoStatusAdicao(solicitacao.status) : textoStatus(solicitacao.status);
  const classeStatus = tipo === "adicao"
    ? `${status === "Aprovado" ? "badge-aprovada" : status === "Rejeitado" ? "badge-rejeitada" : ""}`
    : `badge-${solicitacao.status || "pendente"}`;

  return (
    <div key={`${tipo}-${solicitacao.id_solicitacao || filmeId}`} className="card-solicitacao">
      <div className="info-solicitacao-esquerda">
        <img src={filme.poster || filme.imagem || POSTER_PADRAO} alt={filme.titulo || "Filme"} className="thumb-solicitacao" />
        <div className="textos-solicitacao">
          <h4>{filme.titulo || "Filme nao informado"}</h4>
          <p>{tipo === "adicao" ? filme.ano || "Ano nao informado" : resumirSolicitacao(solicitacao.dados)}</p>
        </div>
      </div>
      <div className="status-solicitacao">
        <span className={`badge-pendente ${classeStatus}`}>{status}</span>
      </div>
    </div>
  );
}

export function SecaoSolicitacoesPerfil({ titulo, vazio, carregandoTexto, solicitacoes, carregando, tipo }) {
  return (
    <section className="secao-perfil">
      <h3>{titulo} ({solicitacoes.length})</h3>
      <div className="lista-solicitacoes">
        {carregando ? (
          <p className="favoritos-vazio">{carregandoTexto}</p>
        ) : solicitacoes.length > 0 ? solicitacoes.map((solicitacao) => (
          <SolicitacaoCard
            key={`${tipo}-${solicitacao.id_solicitacao || solicitacao.filme?.id || solicitacao.filme?.id_filme}`}
            solicitacao={solicitacao}
            tipo={tipo}
          />
        )) : (
          <p className="favoritos-vazio">{vazio}</p>
        )}
      </div>
    </section>
  );
}
