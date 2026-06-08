import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import "./css/popup.css";

const icones = {
  confirmacao: AlertTriangle,
  erro: XCircle,
  sucesso: CheckCircle2,
  aviso: AlertTriangle,
  info: Info,
};

export default function Popup({
  aberto,
  tipo = "info",
  titulo,
  mensagem,
  detalhes = [],
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
  onFechar,
  carregando = false,
}) {
  if (!aberto) return null;

  const Icone = icones[tipo] || Info;
  const ehConfirmacao = tipo === "confirmacao";
  const fechar = onCancelar || onFechar;

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-titulo">
      <div className={`popup-card popup-${tipo}`}>
        <button type="button" className="popup-fechar" onClick={fechar} aria-label="Fechar">
          <X size={18} />
        </button>

        <div className="popup-icone">
          <Icone size={28} />
        </div>

        <h2 id="popup-titulo">{titulo}</h2>
        {mensagem ? <p className="popup-mensagem">{mensagem}</p> : null}

        {detalhes.length > 0 ? (
          <div className="popup-detalhes">
            {detalhes.map((detalhe, index) => (
              <div key={`${detalhe.label}-${index}`} className="popup-detalhe-item">
                <strong>{detalhe.label}</strong>
                <span>{detalhe.valor}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="popup-acoes">
          {ehConfirmacao ? (
            <button type="button" className="popup-btn popup-btn-secundario" onClick={onCancelar} disabled={carregando}>
              {textoCancelar}
            </button>
          ) : null}

          <button
            type="button"
            className="popup-btn popup-btn-principal"
            onClick={ehConfirmacao ? onConfirmar : onFechar}
            disabled={carregando}
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
