import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
import Inicio from "./pages/home";
import Login from "./pages/login"; 
import Cadastro from "./pages/cadastro"; 
import Perfil from "./pages/perfil"; 
import Filmes from "./pages/filmes"; 
import Detalhes from "./pages/detalheFilme"; 
import Gerenciamento from "./pages/pageadm"; 
import AdicionarFilme from "./pages/adicionarFilme";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="filmes" element={<Filmes />} />
          <Route path="perfil" element={<Perfil />} /> 
           <Route path="filme/:id" element={<Detalhes />} />
           <Route path="admin" element={<Gerenciamento />} />
           <Route path="adicionar" element={<AdicionarFilme />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
