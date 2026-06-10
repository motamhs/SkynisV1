import { Save, X } from "lucide-react";
import SeletorMultiploCriavel from "./SeletorMultiploCriavel";

const SELETORES = [
  ["Categorias", "ids_categorias", "categorias", "id_categoria"],
  ["Diretores", "ids_diretores", "diretores", "id_diretor"],
  ["Atores", "ids_atores", "atores", "id_ator"],
  ["Produtoras", "ids_produtoras", "produtoras", "id_produtora"],
  ["Paises", "ids_paises", "paises", "id_pais"],
  ["Idiomas", "ids_linguagens", "linguagens", "id_linguagem"],
];

export default function ModalEdicaoFilme({
  admin,
  form,
  auxiliares,
  buscas,
  novosAuxiliares,
  criacaoAberta,
  criandoAuxiliar,
  salvando,
  onCancelar,
  onSubmit,
  onCampo,
  onBusca,
  onToggleItem,
  onRemoverItem,
  onToggleCriacao,
  onNovoChange,
  onCriarAuxiliar,
}) {
  return (
    <div
      className="modal-edicao-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-edicao"
      onMouseDown={() => {
        if (!salvando) onCancelar();
      }}
    >
      <form className="form-edicao-filme" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="form-edicao-header">
          <h2 id="titulo-modal-edicao">{admin ? "Editar dados do filme" : "Solicitar edicao do filme"}</h2>
          <button type="button" className="btn-cancelar-edicao" onClick={onCancelar}>
            <X size={18} />
            Cancelar
          </button>
        </div>

        <div className="grid-edicao">
          <label className="grupo-edicao">
            <span>Titulo</span>
            <input value={form.titulo} onChange={(event) => onCampo("titulo", event.target.value)} required />
          </label>
          <label className="grupo-edicao">
            <span>Ano</span>
            <input type="number" value={form.ano} onChange={(event) => onCampo("ano", event.target.value)} />
          </label>
          <label className="grupo-edicao">
            <span>Duracao</span>
            <input value={form.duracao} onChange={(event) => onCampo("duracao", event.target.value)} placeholder="HH:MM:SS" />
          </label>
          <label className="grupo-edicao">
            <span>Orcamento</span>
            <input type="number" value={form.orcamento} onChange={(event) => onCampo("orcamento", event.target.value)} />
          </label>
          <label className="grupo-edicao grupo-edicao-largo">
            <span>Sinopse</span>
            <textarea value={form.sinopse} onChange={(event) => onCampo("sinopse", event.target.value)} rows={5} />
          </label>
          {["poster", "banner", "trailer"].map((campo) => (
            <label key={campo} className="grupo-edicao grupo-edicao-largo">
              <span>{campo[0].toUpperCase() + campo.slice(1)}</span>
              <input value={form[campo]} onChange={(event) => onCampo(campo, event.target.value)} />
            </label>
          ))}

          {SELETORES.map(([label, campo, chave, campoId]) => (
            <SeletorMultiploCriavel
              key={campo}
              modo="edicao"
              label={label}
              campo={campo}
              itens={auxiliares[chave]}
              campoId={campoId}
              selecionados={form[campo]}
              busca={buscas[campo]}
              novo={novosAuxiliares[campo]}
              criacaoAberta={criacaoAberta[campo]}
              criando={criandoAuxiliar[campo]}
              onBusca={onBusca}
              onToggleItem={onToggleItem}
              onRemoverItem={onRemoverItem}
              onToggleCriacao={onToggleCriacao}
              onNovoChange={onNovoChange}
              onCriar={onCriarAuxiliar}
            />
          ))}
        </div>

        <button type="submit" className="btn-salvar-edicao" disabled={salvando}>
          <Save size={18} />
          {salvando ? "Salvando..." : admin ? "Salvar alteracoes" : "Enviar solicitacao"}
        </button>
      </form>
    </div>
  );
}
