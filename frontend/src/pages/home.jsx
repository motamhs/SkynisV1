import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import "./css/home.css";

export default function Home() {
    const [filmes, setFilmes] = useState([]);
    const [indiceHero, setIndiceHero] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const buscarFilmes = async () => {
            try {
                const resposta = await fetch("http://localhost:8000/filmes");
                if (resposta.ok) {
                    const dados = await resposta.json();
                    
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

    useEffect(() => {
        const totalDestaques = Math.min(filmes.length, 5);
        if (totalDestaques <= 1) return;

        const intervalo = setInterval(() => {
            setIndiceHero((indiceAtual) => (indiceAtual + 1) % totalDestaques);
        }, 6000);

        return () => clearInterval(intervalo);
    }, [filmes.length]);

    const handleVerDetalhes = (idFilme) => {
        if (!idFilme) return;

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

    const normalizarLista = (valor) => {
        if (!valor) return [];
        if (Array.isArray(valor)) return valor;

        if (typeof valor === "string") {
            try {
                const parsed = JSON.parse(valor);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return valor
                    .split(",")
                    .map((nome) => ({ nome: nome.trim() }))
                    .filter((item) => item.nome);
            }
        }

        return [];
    };

    const nomeItem = (item) => {
        if (!item) return "";
        if (typeof item === "string") return item;

        return [item.nome, item.sobrenome].filter(Boolean).join(" ");
    };

    const nomeDiretorPrincipal = (filme) => {
        const [diretor] = normalizarLista(filme?.diretores);
        return nomeItem(diretor);
    };

    const filmesHero = filmes.slice(0, 5);
    const indiceHeroSeguro = filmesHero.length > 0 ? indiceHero % filmesHero.length : 0;
    const filmeHero = filmesHero[indiceHeroSeguro] || null;
    const outrosFilmes = filmes.slice(5);

    if (carregando) {
        return <div className="carregando">Carregando filmes...</div>;
    }

    const renderizarCategorias = (categoriasData) => {
        if (!categoriasData || categoriasData.length === 0) {
            return <span className="tag">Sem Gênero</span>;
        }

        let cats = [];

        if (typeof categoriasData === 'string') {
            try {
                cats = JSON.parse(categoriasData);
            } catch {
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
            <span key={c.id || c.id_categoria || c.nome} className="tag">{c.nome}</span>
        ));
    };

    return (
        <div className="pagina-inicio">
            {filmeHero && (
                <section
                    key={filmeHero.id || filmeHero.id_filme}
                    className="hero-section"
                    style={{ backgroundImage: `url("${filmeHero.banner}")` }}
                >
                    <div className="hero-gradiente"></div>

                    <div className="hero-conteudo">
                        <h1 className="hero-titulo">{filmeHero.titulo}</h1>
                        <div className="hero-infos">
                            <span>{filmeHero.ano}</span>
                            <span className="bolinha">•</span>
                            <span>{nomeDiretorPrincipal(filmeHero)}</span>
                        </div>
                        <div className="hero-tags">
                            {renderizarCategorias(filmeHero.categorias)}
                        </div>
                        <p className="hero-descricao">
                            {limitarTexto(filmeHero.sinopse, 200)}
                        </p>
                        <div className="hero-botoes">
                            <button
                                className="btn-ver-detalhes-hero"
                                onClick={() => handleVerDetalhes(filmeHero.id || filmeHero.id_filme)}
                            >
                                <Play size={18} fill="currentColor" />
                                Ver detalhes
                            </button>
                            <button className="btn-explorar" onClick={() => navigate("/filmes")}>
                                Explorar Filmes
                            </button>
                        </div>
                        {filmesHero.length > 1 && (
                            <div className="hero-indicadores" aria-label="Filmes em destaque no banner">
                                {filmesHero.map((filme, index) => (
                                    <button
                                        key={`hero-indicador-${filme.id || filme.id_filme}`}
                                        type="button"
                                        className={`hero-indicador${index === indiceHeroSeguro ? " ativo" : ""}`}
                                        onClick={() => setIndiceHero(index)}
                                        aria-label={`Mostrar ${filme.titulo} no banner`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            <div className="listas-container">
                <section className="trilho-filmes">
                    <h2>Em Destaque</h2>
                    <div className="grid-filmes">
                        {outrosFilmes.map((filme) => (
                            <div key={`destaque-${filme.id || filme.id_filme}`} className="card-filme">
                                <img src={filme.poster || filme.imagem} alt={filme.titulo} className="poster-filme" />
                                <div className="card-info">
                                    <h3 className="card-titulo">{filme.titulo}</h3>
                                    <span className="card-ano">{filme.ano}</span>
                                    <div className="card-tags">
                                        {renderizarCategorias(filme.categorias)}
                                    </div>
                                    <button
                                        className="btn-ver-detalhes-card"
                                        onClick={() => handleVerDetalhes(filme.id || filme.id_filme)}
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
