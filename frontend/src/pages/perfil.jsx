import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: "", email: "" });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const buscarDadosUsuario = async () => {
      try {
        const resposta = await fetch("http://localhost:8000/usuarios/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
          const dados = await resposta.json();

          setUsuario({
            nome: `${dados.nome} ${dados.sobrenome || ''}`.trim(),
            email: dados.email
          });
        } else {

          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);
      }
    };

    buscarDadosUsuario();
  }, [navigate]);

  const filmesFavoritos = [
    { id: 1, titulo: "Interestelar", ano: "2014", tags: ["Ficção Científica", "Aventura"], imagem: "https://image.tmdb.org/t/p/w500/nCbkHayesgpiIUFH5fgsczIGg4n.jpg" },
    { id: 2, titulo: "Interestelar", ano: "2014", tags: ["Ficção Científica", "Aventura"], imagem: "https://image.tmdb.org/t/p/w500/nCbkHayesgpiIUFH5fgsczIGg4n.jpg" },
  ];

  const solicitacoes = [
    { id: 101, titulo: "Cavaleiro das Trevas", detalhes: "$ 245 Milhoes - $ 250 Milhões", status: "Pendente", imagem: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" }
  ];

  return (
    <div className="pagina-perfil">
      <div className="perfil-container-interno">


        <section className="card-usuario">
          <div className="avatar-usuario">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e03c2f" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="dados-usuario">
            <h2>{usuario.nome}</h2>
            <p className="email-usuario">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              {usuario.email}
            </p>
            <button className="btn-editar-perfil">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar perfil
            </button>
          </div>
        </section>


        <section className="secao-perfil">
          <h3>Filmes Favoritos ({filmesFavoritos.length})</h3>
          <div className="grid-favoritos">
            {filmesFavoritos.map((filme) => (
              <div key={`fav-${filme.id}`} className="card-filme-favorito">
                <div className="poster-container">
                  <img src={filme.imagem} alt={filme.titulo} className="poster-filme" />

                  <div className="icone-coracao">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e03c2f">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                <div className="card-info">
                  <h4 className="card-titulo">{filme.titulo}</h4>
                  <span className="card-ano">{filme.ano}</span>
                  <div className="card-tags">
                    {filme.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <button
                    className="btn-ver-detalhes-card"
                    onClick={() => navigate(`/filme/${filme.id}`)}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>


        <section className="secao-perfil">
          <h3>Solicitações de Edição ({solicitacoes.length})</h3>
          <div className="lista-solicitacoes">
            {solicitacoes.map((solic) => (
              <div key={solic.id} className="card-solicitacao">
                <div className="info-solicitacao-esquerda">
                  <img src={solic.imagem} alt={solic.titulo} className="thumb-solicitacao" />
                  <div className="textos-solicitacao">
                    <h4>{solic.titulo}</h4>
                    <p>{solic.detalhes}</p>
                  </div>
                </div>
                <div className="status-solicitacao">
                  <span className="badge-pendente">{solic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}