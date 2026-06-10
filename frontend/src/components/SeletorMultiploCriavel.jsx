import { Check, Plus, X } from "lucide-react";
import { CONFIG_CRIACAO_AUXILIAR, idDoItem, nomeItem } from "../utils/movieForm";

const CLASSES = {
  adicionar: {
    grupo: "grupo-adicionar seletor-adicionar",
    chips: "chips-adicionar",
    chip: "chip-adicionar",
    lista: "lista-adicionar",
    opcao: "opcao-adicionar",
    checkbox: "checkbox-adicionar",
    vazio: "sem-opcoes-adicionar",
  },
  edicao: {
    grupo: "grupo-edicao seletor-multiplo",
    chips: "chips-selecionados",
    chip: "chip-selecionado",
    lista: "lista-opcoes-multipla",
    opcao: "opcao-multipla",
    checkbox: "checkbox-multiplo",
    vazio: "sem-opcoes-multipla",
  },
};

export default function SeletorMultiploCriavel({
  label,
  campo,
  itens,
  campoId,
  obrigatorio = false,
  modo = "adicionar",
  selecionados,
  busca,
  novo,
  criacaoAberta,
  criando,
  onBusca,
  onToggleItem,
  onRemoverItem,
  onToggleCriacao,
  onNovoChange,
  onCriar,
}) {
  const classes = CLASSES[modo];
  const config = CONFIG_CRIACAO_AUXILIAR[campo];
  const dadosNovo = { nome: "", sobrenome: "", foto: "", ...(novo || {}) };
  const nomeCriacao = dadosNovo.nome;
  const itensSelecionados = itens.filter((item) => selecionados.includes(String(idDoItem(item, campoId))));
  const itensFiltrados = itens.filter((item) => nomeItem(item).toLowerCase().includes((busca || "").toLowerCase()));
  const existeMesmoNome = itens.some((item) => nomeItem(item).toLowerCase() === nomeCriacao.trim().toLowerCase());

  return (
    <div className={classes.grupo}>
      <div className="seletor-topo">
        <span>{label}{obrigatorio ? " *" : ""}</span>
        {config && (
          <button
            type="button"
            className={`btn-abrir-criacao${criacaoAberta ? " ativo" : ""}`}
            onClick={() => onToggleCriacao(campo)}
          >
            {criacaoAberta ? <X size={14} /> : <Plus size={14} />}
            {criacaoAberta ? "Fechar" : "Novo"}
          </button>
        )}
      </div>

      <input value={busca || ""} onChange={(event) => onBusca(campo, event.target.value)} placeholder={`Buscar ${label.toLowerCase()}`} />

      {config && criacaoAberta && (
        <div className="criacao-auxiliar">
          <strong>{config.titulo}</strong>
          <div className="criacao-campos">
            <input value={nomeCriacao} onChange={(event) => onNovoChange(campo, "nome", event.target.value)} placeholder="Nome" />
            {config.tipo === "pessoa" && (
              <>
                <input value={dadosNovo.sobrenome} onChange={(event) => onNovoChange(campo, "sobrenome", event.target.value)} placeholder="Sobrenome" />
                {config.temFoto && (
                  <input value={dadosNovo.foto} onChange={(event) => onNovoChange(campo, "foto", event.target.value)} placeholder="URL da foto" />
                )}
              </>
            )}
          </div>
          <button
            type="button"
            className="btn-criar-auxiliar"
            onClick={() => onCriar(campo)}
            disabled={criando || !nomeCriacao.trim() || existeMesmoNome}
          >
            <Plus size={15} />
            {criando ? "Criando..." : existeMesmoNome ? "Ja existe" : "Criar e selecionar"}
          </button>
        </div>
      )}

      <div className={classes.chips}>
        {itensSelecionados.length > 0 ? (
          itensSelecionados.map((item) => {
            const itemId = idDoItem(item, campoId);
            return (
              <button key={itemId} type="button" className={classes.chip} onClick={() => onRemoverItem(campo, itemId)}>
                {nomeItem(item)}
                <X size={14} />
              </button>
            );
          })
        ) : (
          <small>Nenhum selecionado</small>
        )}
      </div>

      <div className={classes.lista}>
        {itensFiltrados.length > 0 ? (
          itensFiltrados.map((item) => {
            const itemId = idDoItem(item, campoId);
            const selecionado = selecionados.includes(String(itemId));
            return (
              <button
                key={itemId}
                type="button"
                className={`${classes.opcao}${selecionado ? " selecionada" : ""}`}
                onClick={() => onToggleItem(campo, itemId)}
              >
                <span className={classes.checkbox}>{selecionado ? <Check size={13} /> : ""}</span>
                <span>{nomeItem(item)}</span>
              </button>
            );
          })
        ) : (
          <p className={classes.vazio}>Nenhum resultado.</p>
        )}
      </div>
    </div>
  );
}
