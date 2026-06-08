import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, Film, Pencil, Trash2, X } from "lucide-react";
import Popup from "../components/popup";
import "./css/pageadm.css";

export default function Admin() {
  const [filmes, setFilmes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [popup, setPopup] = useState({ aberto: false });
  const navigate = useNavigate();

  const [edicoesPendentes, setEdicoesPendentes] = useState([
    {
      id: 1,
      filme_id: 10,
      titulo: "Cavaleiro das Trevas",
      solicitante: "Victor Silva",
      data: "15/04/2026",
      campo: "Custos",
      valor_antigo: "$ 245 Milhoes",
      valor_novo: "$ 250 Milhões",
      poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
    }
  ]);

  const token = localStorage.getItem("access_token");

  const getIdFilme = (filme) => filme.id || filme.id_filme;
  const fecharPopup = () => setPopup({ aberto: false });

  const usuarioEhAdmin = useCallback(() => {
    if (!token) return false;

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = JSON.parse(
        atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
      );

      return payloadJson.role === "admin";
    } catch (erro) {
      console.error("Erro ao ler token de admin:", erro);
      return false;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!usuarioEhAdmin()) {
      navigate("/");
      return;
    }

    const buscarDadosAdmin = async () => {
      try {
        const [respFilmes, respPendentes] = await Promise.all([
          fetch("http://localhost:8000/filmes"),
          fetch("http://localhost:8000/filmes/pendentes", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (respFilmes.ok) {
          const dadosFilmes = await respFilmes.json();

          setFilmes(dadosFilmes.filter(f => f.flag === 1 || f.flag === true)); 
        }

        if (respPendentes.ok) {
          const dadosPendentes = await respPendentes.json();
          setPendentes(dadosPendentes);
        } else if (respPendentes.status === 401 || respPendentes.status === 403) {
   
          navigate("/");
        }
      } catch (erro) {
        console.error("Erro ao buscar dados do painel:", erro);
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosAdmin();
  }, [token, navigate, usuarioEhAdmin]);


  const handleAprovarFilme = async (idFilme) => {
    try {
      const resp = await fetch(`http://localhost:8000/filmes/${idFilme}/aprovar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resp.ok) {
   
        const filmeAprovado = pendentes.find(f => getIdFilme(f) === idFilme);
        setPendentes(pendentes.filter(f => getIdFilme(f) !== idFilme));
        if (filmeAprovado) {
          setFilmes([...filmes, { ...filmeAprovado, flag: 1 }]);
        }
        setPopup({
          aberto: true,
          tipo: "sucesso",
          titulo: "Filme aprovado com sucesso",
          mensagem: "O filme agora aparece no catalogo.",
          textoConfirmar: "Fechar",
          onFechar: fecharPopup,
        });
      } else {
        setPopup({
          aberto: true,
          tipo: "erro",
          titulo: "Erro ao aprovar filme",
          mensagem: "Nao foi possivel aprovar o filme.",
          textoConfirmar: "Fechar",
          onFechar: fecharPopup,
        });
      }
    } catch (e) {
      console.error(e);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao aprovar filme",
        mensagem: "Nao foi possivel conectar ao servidor.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    }
  };


  const executarDeletarFilme = async (idFilme, isPendente = false, titulo = "filme") => {
    try {
      setPopup((atual) => ({ ...atual, carregando: true }));

      const resp = await fetch(`http://localhost:8000/filmes/${idFilme}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (resp.ok) {
        if (isPendente) {
          setPendentes(pendentes.filter(f => getIdFilme(f) !== idFilme));
        } else {
          setFilmes(filmes.filter(f => getIdFilme(f) !== idFilme));
        }
        setPopup({
          aberto: true,
          tipo: "sucesso",
          titulo: "Filme excluido com sucesso",
          mensagem: `"${titulo}" foi removido do catalogo.`,
          textoConfirmar: "Fechar",
          onFechar: fecharPopup,
        });
      } else {
        setPopup({
          aberto: true,
          tipo: "erro",
          titulo: "Erro ao excluir filme",
          mensagem: "Nao foi possivel excluir este filme.",
          textoConfirmar: "Fechar",
          onFechar: fecharPopup,
        });
      }
    } catch (e) {
      console.error(e);
      setPopup({
        aberto: true,
        tipo: "erro",
        titulo: "Erro ao excluir filme",
        mensagem: "Nao foi possivel conectar ao servidor.",
        textoConfirmar: "Fechar",
        onFechar: fecharPopup,
      });
    }
  };

  const handleDeletarFilme = (filme, isPendente = false) => {
    const idFilme = getIdFilme(filme);

    setPopup({
      aberto: true,
      tipo: "confirmacao",
      titulo: "Certeza que deseja excluir filme?",
      mensagem: `Esta acao vai remover "${filme.titulo}" do catalogo.`,
      detalhes: [{ label: "Filme", valor: `${filme.titulo} - ID ${idFilme}` }],
      textoConfirmar: "Excluir",
      textoCancelar: "Cancelar",
      onCancelar: fecharPopup,
      onConfirmar: () => executarDeletarFilme(idFilme, isPendente, filme.titulo),
    });
  };

  if (carregando) return <div className="admin-loading">Carregando painel...</div>;

  return (
    <div className="pagina-admin">
      <div className="admin-container">
        <h1 className="admin-titulo-secao">Painel Administrativo</h1>

  
        <div className="admin-resumo-grid">
          <div className="admin-card-resumo">
            <Film size={32} color="#e03c2f" />
            <h2>{filmes.length}</h2>
            <p>Total de Filmes</p>
          </div>
          
          <div className="admin-card-resumo">
            <Clock size={32} color="#eab308" />
            <h2>{pendentes.length}</h2>
            <p>Filmes Pendentes</p>
          </div>

          <div className="admin-card-resumo">
            <Pencil size={32} color="#3b82f6" />
            <h2>{edicoesPendentes.length}</h2>
            <p>Edições Pendentes</p>
          </div>
        </div>


        <h2 className="admin-titulo-secao">Filmes Pendentes</h2>
        <div className="admin-lista-vertical">
          {pendentes.length === 0 ? <p className="admin-vazio">Nenhum filme pendente.</p> : null}

          {pendentes.map(filme => (
            <div key={`pendente-${getIdFilme(filme)}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={filme.imagem || filme.poster} alt={filme.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{filme.titulo}</h3>
                  <p>{filme.ano} • ID: {getIdFilme(filme)}</p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-aprovar" onClick={() => handleAprovarFilme(getIdFilme(filme))} title="Aprovar Filme">
                  <Check size={20} strokeWidth={3} />
                </button>
                <button className="btn-deletar" onClick={() => handleDeletarFilme(filme, true)} title="Excluir Filme">
                  <Trash2 size={20} color="#e03c2f" />
                </button>
              </div>
            </div>
          ))}
        </div>


        <h2 className="admin-titulo-secao">Solicitações de Edição</h2>
        <div className="admin-lista-vertical">
          {edicoesPendentes.length === 0 ? <p className="admin-vazio">Nenhuma edição pendente.</p> : null}

          {edicoesPendentes.map(edicao => (
            <div key={`ed-${edicao.id}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={edicao.poster} alt={edicao.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{edicao.titulo}</h3>
                  <p className="admin-subtexto">por {edicao.solicitante} • {edicao.data}</p>
                  <p className="admin-subtexto">campo: <span>{edicao.campo}</span></p>
                  <p className="admin-comparacao">
                    <span className="valor-antigo">{edicao.valor_antigo}</span> - <span className="valor-novo">{edicao.valor_novo}</span>
                  </p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-aprovar" onClick={() => setPopup({
                  aberto: true,
                  tipo: "sucesso",
                  titulo: "Edicao aprovada",
                  mensagem: "A solicitacao foi aprovada.",
                  textoConfirmar: "Fechar",
                  onFechar: fecharPopup,
                })}>
                  <Check size={20} strokeWidth={3} />
                </button>
                <button className="btn-rejeitar" onClick={() => setEdicoesPendentes([])}>
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>


        <h2 className="admin-titulo-secao">Todos os Filmes</h2>
        <div className="admin-lista-vertical">
          {filmes.length === 0 ? <p className="admin-vazio">Nenhum filme catalogado.</p> : null}

          {filmes.map(filme => (
            <div key={`all-${getIdFilme(filme)}`} className="admin-item-lista">
              <div className="admin-item-info">
                <img src={filme.imagem || filme.poster} alt={filme.titulo} className="admin-item-poster" />
                <div className="admin-textos">
                  <h3>{filme.titulo}</h3>
                  <p>{filme.ano} • ID: {getIdFilme(filme)}</p>
                </div>
              </div>
              <div className="admin-item-acoes">
                <button className="btn-deletar" onClick={() => handleDeletarFilme(filme, false)} title="Excluir Filme">
                  <Trash2 size={20} color="#e03c2f" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      <Popup
        aberto={popup.aberto}
        tipo={popup.tipo}
        titulo={popup.titulo}
        mensagem={popup.mensagem}
        detalhes={popup.detalhes}
        textoConfirmar={popup.textoConfirmar}
        textoCancelar={popup.textoCancelar}
        onConfirmar={popup.onConfirmar}
        onCancelar={popup.onCancelar}
        onFechar={popup.onFechar}
        carregando={popup.carregando}
      />
    </div>
  );
}
