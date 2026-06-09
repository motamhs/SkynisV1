import CardFilme from "./CardFilme";
import "./css/TrilhoFilmes.css";

export default function TrilhoFilmes({ titulo, itens, prefixo, mensagemVazia }) {
    return (
        <section className="trilho-filmes">
            <h2>{titulo}</h2>
            <div className="grid-filmes">
                {itens.length > 0 ? (
                    itens.map((item) => {
                        const filme = item.filme || item;
                        const filmeId = filme.id || filme.id_filme;
                        return (
                            <CardFilme
                                key={`${prefixo}-${filmeId}`}
                                filme={filme}
                                media={item.media}
                                total={item.total}
                                prefixo={prefixo}
                            />
                        );
                    })
                ) : (
                    <p className="sem-filmes">{mensagemVazia || "Nenhum filme disponível."}</p>
                )}
            </div>
        </section>
    );
}
