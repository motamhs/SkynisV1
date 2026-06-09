import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import CardFilme from "../components/CardFilme";
import "./css/filmes.css";

export default function Filmes() {
    const [filmes, setFilmes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filmesFiltrados, setFilmesFiltrados] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
    const [aCarregar, setACarregar] = useState(true);

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const [respFilmes, respCategorias] = await Promise.all([
                    fetch("http://localhost:8000/filmes"),
                    fetch("http://localhost:8000/dados/categorias"),
                ]);

                if (respFilmes.ok) {
                    const dados = await respFilmes.json();
                    const aprovados = dados.filter((f) => f.flag === 1 || f.flag === true);
                    setFilmes(aprovados);
                    setFilmesFiltrados(aprovados);
                }
                if (respCategorias.ok) setCategorias(await respCategorias.json());
            } catch (erro) {
                console.error("Erro ao buscar dados:", erro);
            } finally {
                setACarregar(false);
            }
        };

        buscarDados();
    }, []);

    useEffect(() => {
        let resultado = filmes;

        if (pesquisa) {
            const termo = pesquisa.toLowerCase();
            resultado = resultado.filter((f) => f.titulo.toLowerCase().includes(termo));
        }

        if (categoriaSelecionada) {
            const categoriaObj = categorias.find(
                (c) =>
                    String(c.id) === String(categoriaSelecionada) ||
                    String(c.id_categoria) === String(categoriaSelecionada)
            );
            const nomeSelecionado = categoriaObj ? categoriaObj.nome.toLowerCase() : "";

            resultado = resultado.filter((filme) => {
                if (!filme.categorias) return false;

                let cats = [];
                if (typeof filme.categorias === "string") {
                    try { cats = JSON.parse(filme.categorias); }
                    catch { cats = filme.categorias.split(",").map((n) => ({ nome: n.trim() })); }
                } else if (Array.isArray(filme.categorias)) {
                    cats = filme.categorias;
                }

                if (!Array.isArray(cats)) return false;

                return cats.some(
                    (c) =>
                        (c.id && String(c.id) === String(categoriaSelecionada)) ||
                        (c.id_categoria && String(c.id_categoria) === String(categoriaSelecionada)) ||
                        (c.nome && c.nome.toLowerCase() === nomeSelecionado)
                );
            });
        }

        setFilmesFiltrados(resultado);
    }, [pesquisa, categoriaSelecionada, filmes, categorias]);

    const limparFiltros = () => {
        setPesquisa("");
        setCategoriaSelecionada("");
    };

    if (aCarregar) return <div className="a-carregar">Carregando filmes...</div>;

    return (
        <div className="pagina-filmes">
            <div className="filmes-container-interno">
                <h1 className="titulo-pagina">Filmes</h1>

                <div className="barra-filtros">
                    <div className="campo-pesquisa">
                        <Search size={18} color="#888" />
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />
                    </div>

                    <div className="filtros-dropdown">
                        <select
                            className="select-filtro"
                            value={categoriaSelecionada}
                            onChange={(e) => setCategoriaSelecionada(e.target.value)}
                        >
                            <option value="">Todos os Gêneros</option>
                            {categorias.map((cat) => {
                                const catId = cat.id || cat.id_categoria;
                                return (
                                    <option key={catId} value={catId}>
                                        {cat.nome}
                                    </option>
                                );
                            })}
                        </select>

                        <button className="btn-limpar-filtros" onClick={limparFiltros}>
                            <X size={16} color="#e03c2f" />
                        </button>
                    </div>
                </div>

                <div className="grid-todos-filmes">
                    {filmesFiltrados.length > 0 ? (
                        filmesFiltrados.map((filme) => (
                            <CardFilme
                                key={`filme-${filme.id || filme.id_filme}`}
                                filme={filme}
                                prefixo="filme"
                            />
                        ))
                    ) : (
                        <p className="sem-resultados">Nenhum filme encontrado com este filtro.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
