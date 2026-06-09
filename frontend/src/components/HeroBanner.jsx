import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TagsFilme } from "./CardFilme";
import "./css/HeroBanner.css";

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
            return valor.split(",").map((nome) => ({ nome: nome.trim() })).filter((i) => i.nome);
        }
    }
    return [];
};

const nomeItem = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return [item.nome, item.sobrenome].filter(Boolean).join(" ");
};

export default function HeroBanner({ filmesHero, indiceAtivo, onMudarIndice }) {
    const navigate = useNavigate();

    const indiceSeguro = filmesHero.length > 0 ? indiceAtivo % filmesHero.length : 0;
    const filme = filmesHero[indiceSeguro] || null;

    if (!filme) return null;

    const filmeId = filme.id || filme.id_filme;
    const [diretor] = normalizarLista(filme?.diretores);
    const nomeDiretor = nomeItem(diretor);

    const handleVerDetalhes = () => {
        const token = localStorage.getItem("access_token");
        if (!token) navigate("/login");
        else navigate(`/filme/${filmeId}`);
    };

    return (
        <section
            key={filmeId}
            className="hero-section"
            style={{ backgroundImage: `url("${filme.banner}")` }}
        >
            <div className="hero-gradiente" />

            <div className="hero-conteudo">
                <h1 className="hero-titulo">{filme.titulo}</h1>

                <div className="hero-infos">
                    <span>{filme.ano}</span>
                    <span className="bolinha">•</span>
                    <span>{nomeDiretor}</span>
                </div>

                <div className="hero-tags">
                    <TagsFilme categorias={filme.categorias} />
                </div>

                <p className="hero-descricao">{limitarTexto(filme.sinopse, 200)}</p>

                <div className="hero-botoes">
                    <button className="btn-ver-detalhes-hero" onClick={handleVerDetalhes}>
                        <Play size={18} fill="currentColor" />
                        Ver detalhes
                    </button>
                    <button className="btn-explorar" onClick={() => navigate("/filmes")}>
                        Explorar Filmes
                    </button>
                </div>

                {filmesHero.length > 1 && (
                    <div className="hero-indicadores" aria-label="Filmes em destaque no banner">
                        {filmesHero.map((f, index) => (
                            <button
                                key={`hero-indicador-${f.id || f.id_filme}`}
                                type="button"
                                className={`hero-indicador${index === indiceSeguro ? " ativo" : ""}`}
                                onClick={() => onMudarIndice(index)}
                                aria-label={`Mostrar ${f.titulo} no banner`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
