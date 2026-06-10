import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import CardFilme from "../components/CardFilme";
import "./css/filmes.css";

const API_URL = "http://localhost:8000";

const getPessoaNome = (pessoa) => {
    const partes = [pessoa?.nome, pessoa?.sobrenome].filter(Boolean);
    return partes.join(" ");
};

export default function Filmes() {
    const [filmes, setFilmes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [diretores, setDiretores] = useState([]);
    const [atores, setAtores] = useState([]);
    const [anos, setAnos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
    const [anoSelecionado, setAnoSelecionado] = useState("");
    const [diretorSelecionado, setDiretorSelecionado] = useState("");
    const [atorSelecionado, setAtorSelecionado] = useState("");
    const [aCarregar, setACarregar] = useState(true);
    const [aFiltrar, setAFiltrar] = useState(false);

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const [respFilmes, respCategorias, respDiretores, respAtores] = await Promise.all([
                    fetch(`${API_URL}/filmes?limit=100`),
                    fetch(`${API_URL}/dados/categorias`),
                    fetch(`${API_URL}/dados/diretores`),
                    fetch(`${API_URL}/dados/atores`),
                ]);

                if (respFilmes.ok) {
                    const dados = await respFilmes.json();
                    const aprovados = dados.filter((f) => f.flag === 1 || f.flag === true);
                    setFilmes(aprovados);
                    setAnos(
                        [...new Set(aprovados.map((filme) => filme.ano).filter(Boolean))]
                            .sort((a, b) => b - a)
                    );
                }

                if (respCategorias.ok) setCategorias(await respCategorias.json());
                if (respDiretores.ok) setDiretores(await respDiretores.json());
                if (respAtores.ok) setAtores(await respAtores.json());
            } catch (erro) {
                console.error("Erro ao buscar dados:", erro);
            } finally {
                setACarregar(false);
            }
        };

        buscarDados();
    }, []);

    useEffect(() => {
        if (aCarregar) return;

        const buscarFilmesFiltrados = async () => {
            setAFiltrar(true);

            try {
                const params = new URLSearchParams({ limit: "100" });

                if (pesquisa.trim()) params.set("titulo", pesquisa.trim());
                if (categoriaSelecionada) params.set("categoria", categoriaSelecionada);
                if (anoSelecionado) params.set("ano", anoSelecionado);
                if (diretorSelecionado) params.set("diretor", diretorSelecionado);
                if (atorSelecionado) params.set("ator", atorSelecionado);

                const resposta = await fetch(`${API_URL}/filmes?${params.toString()}`);

                if (resposta.ok) {
                    const dados = await resposta.json();
                    setFilmes(dados.filter((f) => f.flag === 1 || f.flag === true));
                }
            } catch (erro) {
                console.error("Erro ao filtrar filmes:", erro);
            } finally {
                setAFiltrar(false);
            }
        };

        buscarFilmesFiltrados();
    }, [pesquisa, categoriaSelecionada, anoSelecionado, diretorSelecionado, atorSelecionado, aCarregar]);

    const limparFiltros = () => {
        setPesquisa("");
        setCategoriaSelecionada("");
        setAnoSelecionado("");
        setDiretorSelecionado("");
        setAtorSelecionado("");
    };

    const temFiltrosAtivos =
        pesquisa || categoriaSelecionada || anoSelecionado || diretorSelecionado || atorSelecionado;

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
                            placeholder="Buscar por titulo..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />
                    </div>

                    <div className="acoes-filtros">
                        <button
                            className="btn-limpar-filtros"
                            onClick={limparFiltros}
                            disabled={!temFiltrosAtivos}
                            title="Limpar filtros"
                        >
                            <X size={16} />
                            Limpar
                        </button>
                    </div>

                    <div className="filtros-grid">
                        <label className="grupo-filtro">
                            <span>Genero</span>
                            <select
                                className="select-filtro"
                                value={categoriaSelecionada}
                                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {categorias.map((cat) => {
                                    const catId = cat.id || cat.id_categoria;
                                    return (
                                        <option key={catId} value={catId}>
                                            {cat.nome}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>

                        <label className="grupo-filtro">
                            <span>Ano</span>
                            <select
                                className="select-filtro"
                                value={anoSelecionado}
                                onChange={(e) => setAnoSelecionado(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {anos.map((ano) => (
                                    <option key={ano} value={ano}>
                                        {ano}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grupo-filtro">
                            <span>Diretor</span>
                            <select
                                className="select-filtro"
                                value={diretorSelecionado}
                                onChange={(e) => setDiretorSelecionado(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {diretores.map((diretor) => (
                                    <option key={diretor.id_diretor} value={diretor.id_diretor}>
                                        {getPessoaNome(diretor)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grupo-filtro">
                            <span>Ator</span>
                            <select
                                className="select-filtro"
                                value={atorSelecionado}
                                onChange={(e) => setAtorSelecionado(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {atores.map((ator) => (
                                    <option key={ator.id_ator} value={ator.id_ator}>
                                        {getPessoaNome(ator)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {aFiltrar && <span className="status-filtros">Atualizando resultados...</span>}

                <div className="grid-todos-filmes">
                    {filmes.length > 0 ? (
                        filmes.map((filme) => (
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
