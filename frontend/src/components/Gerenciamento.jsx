import { Check, Clock, Film, Pencil, Trash2, X } from "lucide-react";
import { formatarData, pegarIdFilme, obterResumoEdicao } from "../utils/edicoesGerenciamento";

const POSTER_PADRAO = "https://placehold.co/160x240/111111/e03c2f?text=Sem+Poster";

function ResumoCard({ icone, valor, rotulo }) {
  return (
    <div className="admin-card-resumo">
      {icone}
      <h2>{valor}</h2>
      <p>{rotulo}</p>
    </div>
  );
}

export function ResumoGerenciamento({ totalFilmes, totalPendentes, totalEdicoes }) {
  return (
    <div className="admin-resumo-grid">
      <ResumoCard icone={<Film size={32} color="#e03c2f" />} valor={totalFilmes} rotulo="Total de Filmes" />
      <ResumoCard icone={<Clock size={32} color="#eab308" />} valor={totalPendentes} rotulo="Filmes Pendentes" />
      <ResumoCard icone={<Pencil size={32} color="#3b82f6" />} valor={totalEdicoes} rotulo="Edicoes Pendentes" />
    </div>
  );
}

function FilmeItem({ filme, pendente = false, onAprovar, onExcluir }) {
  const idFilme = pegarIdFilme(filme);

  return (
    <div className="admin-item-lista">
      <div className="admin-item-info">
        <img src={filme.imagem || filme.poster || POSTER_PADRAO} alt={filme.titulo} className="admin-item-poster" />
        <div className="admin-textos">
          <h3>{filme.titulo}</h3>
          <p>{filme.ano} - ID: {idFilme}</p>
        </div>
      </div>
      <div className="admin-item-acoes">
        {pendente && (
          <button className="btn-aprovar" onClick={() => onAprovar(idFilme)} title="Aprovar Filme">
            <Check size={20} strokeWidth={3} />
          </button>
        )}
        <button className="btn-deletar" onClick={() => onExcluir(filme, pendente)} title="Excluir Filme">
          <Trash2 size={20} color="#e03c2f" />
        </button>
      </div>
    </div>
  );
}

export function SecaoFilmes({ titulo, vazio, filmes, pendente = false, onAprovar, onExcluir }) {
  return (
    <>
      <h2 className="admin-titulo-secao">{titulo}</h2>
      <div className="admin-lista-vertical">
        {filmes.length === 0 ? <p className="admin-vazio">{vazio}</p> : null}

        {filmes.map((filme) => (
          <FilmeItem
            key={`${pendente ? "pendente" : "all"}-${pegarIdFilme(filme)}`}
            filme={filme}
            pendente={pendente}
            onAprovar={onAprovar}
            onExcluir={onExcluir}
          />
        ))}
      </div>
    </>
  );
}

function AlteracaoEdicao({ item }) {
  return (
    <p className="admin-subtexto admin-comparacao">
      {item.label}: <span className="valor-antigo">{item.antes}</span>{" "}
      <span className="seta-comparacao">-&gt;</span>{" "}
      <span className="valor-novo">{item.depois}</span>
    </p>
  );
}

function SolicitacaoEdicaoItem({ edicao, auxiliares, onAnalisar }) {
  const alteracoes = obterResumoEdicao(edicao, auxiliares);

  return (
    <div className="admin-item-lista">
      <div className="admin-item-info">
        <img src={edicao.filme?.poster || edicao.filme?.imagem || POSTER_PADRAO} alt={edicao.filme?.titulo} className="admin-item-poster" />
        <div className="admin-textos">
          <h3>{edicao.filme?.titulo || "Filme nao informado"}</h3>
          <p className="admin-subtexto">
            por {edicao.usuario?.apelido || edicao.usuario?.nome || "usuario"} {formatarData(edicao.data_criacao)}
          </p>
          {alteracoes.length === 0 ? (
            <p className="admin-subtexto">Nenhuma mudanca detectada.</p>
          ) : alteracoes.map((item) => (
            <AlteracaoEdicao key={item.campo} item={item} />
          ))}
        </div>
      </div>
      <div className="admin-item-acoes">
        <button className="btn-aprovar" onClick={() => onAnalisar(edicao, "aprovar")} title="Aprovar Edicao">
          <Check size={20} strokeWidth={3} />
        </button>
        <button className="btn-rejeitar" onClick={() => onAnalisar(edicao, "rejeitar")} title="Rejeitar Edicao">
          <X size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export function SecaoEdicoes({ edicoes, auxiliares, onAnalisar }) {
  return (
    <>
      <h2 className="admin-titulo-secao">Solicitacoes de Edicao</h2>
      <div className="admin-lista-vertical">
        {edicoes.length === 0 ? <p className="admin-vazio">Nenhuma edicao pendente.</p> : null}

        {edicoes.map((edicao) => (
          <SolicitacaoEdicaoItem
            key={`ed-${edicao.id_solicitacao}`}
            edicao={edicao}
            auxiliares={auxiliares}
            onAnalisar={onAnalisar}
          />
        ))}
      </div>
    </>
  );
}
