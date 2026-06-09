import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./css/CardFilme.css";

const normalizarCategorias = (categoriasData) => {
    if (!categoriasData || categoriasData.length === 0) return null;

    let cats = [];

    if (typeof categoriasData === "string") {
        try {
            cats = JSON.parse(categoriasData);
        } catch {
            cats = categoriasData
                .split(",")
                .map((nome, index) => ({ id: `cat-${index}`, nome: nome.trim() }));
        }
    } else if (Array.isArray(categoriasData)) {
        cats = categoriasData;
    }

    return cats.filter((c) => c && c.nome && String(c.nome) !== "null");
};

export function TagsFilme({ categorias }) {
    const cats = normalizarCategorias(categorias);
    if (!cats || cats.length === 0) return <span className="tag">Sem Gênero</span>;
    return cats
        .slice(0, 2)
        .map((c) => (
            <span key={c.id || c.id_categoria || c.nome} className="tag">
                {c.nome}
            </span>
        ));
}

export default function CardFilme({ filme, media, total, prefixo }) {
    const navigate = useNavigate();

    const filmeId = filme?.id || filme?.id_filme;
    const mediaNum = Number(media || 0);
    const totalNum = Number(total || 0);

    const handleVerDetalhes = () => {
        const token = localStorage.getItem("access_token");
        if (!token) navigate("/login");
        else navigate(`/filme/${filmeId}`);
    };

    return (
        <div key={`${prefixo}-${filmeId}`} className="card-filme">
            <img
                src={filme.poster || filme.imagem}
                alt={filme.titulo}
                className="poster-filme"
            />
            <div className="card-info">
                <h3 className="card-titulo">{filme.titulo}</h3>
                <span className="card-ano">{filme.ano}</span>

                {(media !== undefined || total !== undefined) && (
                    <div className="card-avaliacao">
                        <Star size={14} fill="currentColor" />
                        <span>{mediaNum.toFixed(1)}</span>
                        <small>
                            {totalNum} {totalNum === 1 ? "voto" : "votos"}
                        </small>
                    </div>
                )}

                <div className="card-tags">
                    <TagsFilme categorias={filme.categorias} />
                </div>

                <button className="btn-ver-detalhes-card" onClick={handleVerDetalhes}>
                    Ver detalhes
                </button>
            </div>
        </div>
    );
}
