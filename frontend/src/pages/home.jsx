import { useState, useEffect } from "react";
import HeroBanner from "../components/HeroBanner";
import TrilhoFilmes from "../components/TrilhoFilmes";
import "./css/home.css";

export default function Home() {
    const [filmes, setFilmes] = useState([]);
    const [melhoresClassificados, setMelhoresClassificados] = useState([]);
    const [novidades, setNovidades] = useState([]);
    const [indiceHero, setIndiceHero] = useState(0);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const buscarFilmes = async () => {
            try {
                const [resposta, respMelhores, respNovidades] = await Promise.all([
                    fetch("http://localhost:8000/filmes"),
                    fetch("http://localhost:8000/filmes/rankings/melhores?limit=6"),
                    fetch("http://localhost:8000/filmes/rankings/novidades?limit=6"),
                ]);

                if (resposta.ok) {
                    const dados = await resposta.json();
                    setFilmes(dados.filter((f) => f.flag === true || f.flag === 1));
                }
                if (respMelhores.ok) setMelhoresClassificados(await respMelhores.json());
                if (respNovidades.ok) setNovidades(await respNovidades.json());
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
            setIndiceHero((i) => (i + 1) % totalDestaques);
        }, 6000);

        return () => clearInterval(intervalo);
    }, [filmes.length]);

    if (carregando) return <div className="carregando">Carregando filmes...</div>;

    const filmesHero = filmes.slice(0, 5);

    return (
        <div className="pagina-inicio">
            <HeroBanner
                filmesHero={filmesHero}
                indiceAtivo={indiceHero}
                onMudarIndice={setIndiceHero}
            />

            <div className="listas-container">
                <TrilhoFilmes
                    titulo="Melhores Classificados"
                    itens={melhoresClassificados}
                    prefixo="melhor"
                    mensagemVazia="Nenhum filme classificado ainda."
                />
                <TrilhoFilmes
                    titulo="Novidade"
                    itens={novidades}
                    prefixo="novidade"
                    mensagemVazia="Nenhuma novidade disponível."
                />
            </div>
        </div>
    );
}
