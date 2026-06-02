import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/home.css";

export default function Home() {
    const [filmes, setFilmes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const buscarFilmes = async () => {
            try {
                // Atualizado para a nova rota do FastAPI
                const resposta = await fetch("http://localhost:8000/filmes");
                if (resposta.ok) {
                    const dados = await resposta.json();
                    
                    // Filtra para garantir que apenas filmes aprovados apareçam na Home
                    const aprovados = dados.filter(f => f.flag === true || f.flag === 1);
                    setFilmes(aprovados);
                }
            } catch (erro) {
                console.error("Erro ao buscar filmes:", erro);
            } finally {
                setCarregando(false);
            }
        };

        buscarFilmes();
    }, []);

    const handleVerDetalhes = (idFilme) => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
        } else {
            navigate(`/filme/${idFilme}`);
        }
    };

    const limitarTexto = (texto, limite) => {
        if (!texto) return "Mergulhe nesta história envolvente e descubra os segredos que aguardam.";
        if (texto.length <= limite) return texto;
        return texto.substring(0, limite) + "...";
    };

    if (carregando) {
        return <div className="carregando">Carregando filmes...</div>;
    }

    const filmeHero = filmes.length > 0 ? filmes[0] : null;
    const outrosFilmes = filmes.slice(1);

    const renderizarCategorias = (categoriasData) => {
        if (!categoriasData || categoriasData.length === 0) {
            return <span className="tag">Sem Gênero</span>;
        }

        let cats = [];

        if (typeof categoriasData === 'string') {
            try {
                cats = JSON.parse(categoriasData);
            } catch (e) {
                cats = categoriasData.split(',').map((nome, index) => ({
                    id: `cat-${index}-${Math.random()}`,
                    nome: nome.trim()
                }));
            }
        } else if (Array.isArray(categoriasData)) {
            cats = categoriasData;
        }


        const categoriasValidas = cats.filter(c => c && c.nome && String(c.nome) !== "null");

        if (categoriasValidas.length === 0) return <span className="tag">Sem Gênero</span>;

    
        return categoriasValidas.slice(0, 2).map((c) => (
            <span key={c.id} className="tag">{c.nome}</span>
        ));
    };

    return (
        <div className="pagina-inicio">
            {filmeHero && (
                <section
                    className="hero-section"
                    style={{ backgroundImage: `url('https://cdn.crusoe.com.br/uploads/2025/08/AAAABWfz8lKE462s2FJGRKy547BrnBCeFrkDfXSfioM73OJkgn-Ee0du7Pz3T4ekqvxe3iFYw6z10S0SlMcoiKwe2xeGRYqNJ6QD-Qyk.jpg')` }}
                >
                    <div className="hero-gradiente"></div>

                    <div className="hero-conteudo">
                        <h1 className="hero-titulo">{filmeHero.titulo}</h1>
                        <div className="hero-infos">
                            <span>{filmeHero.ano}</span>
                            <span className="bolinha">•</span>
                            <span>{filmeHero.duracao || "N/A"}</span>
                        </div>
                        <p className="hero-descricao">
                            {limitarTexto(filmeHero.sinopse, 200)}
                        </p>
                        <div className="hero-botoes">
                            <button
                                className="btn-ver-detalhes-hero"
                                onClick={() => handleVerDetalhes(filmeHero.id)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Ver detalhes
                            </button>
                            <button className="btn-explorar" onClick={() => navigate("/filmes")}>
                                Explorar Filmes
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <div className="listas-container">
                <section className="trilho-filmes">
                    <h2>Em Destaque</h2>
                    <div className="grid-filmes">
                        {outrosFilmes.map((filme) => (
                            <div key={`destaque-${filme.id}`} className="card-filme">
                                {/* Atualizado para usar filme.poster acompanhando o novo schemas.py */}
                                <img src={filme.poster || filme.imagem} alt={filme.titulo} className="poster-filme" />
                                <div className="card-info">
                                    <h3 className="card-titulo">{filme.titulo}</h3>
                                    <span className="card-ano">{filme.ano}</span>
                                    <div className="card-tags">
                                        {/* Renderiza as tags lendo direto do filme */}
                                        {renderizarCategorias(filme.categorias)}
                                    </div>
                                    <button
                                        className="btn-ver-detalhes-card"
                                        onClick={() => handleVerDetalhes(filme.id)}
                                    >
                                        Ver detalhes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}