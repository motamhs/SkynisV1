# Filminis

Projeto web para catalogo de filmes, com backend em FastAPI e frontend em React + Vite.

O repositorio esta dividido em duas partes:

```text
backend/   API, banco de dados e regras de negocio
frontend/  Interface web da aplicacao
```

## Pre-requisitos

- Python 3.11 ou superior
- Node.js 20 ou superior
- MySQL 8.0 ou superior
- npm

## Como rodar o backend

Entre na pasta do backend:

```bash
cd backend
```

Crie e ative o ambiente virtual:

```bash
python -m venv env

# Windows
env\Scripts\activate

# Linux/macOS
source env/bin/activate
```

Instale as dependencias:

```bash
pip install -r requirements.txt
```

Configure o banco MySQL e rode o script inicial:

```bash
mysql -u root -p < filminis-DDL-DML.sql
```

Confira as variaveis no arquivo `.env` do backend, como usuario, senha e nome do banco.

Inicie a API:

```bash
uvicorn app.main:app --reload
```


Mais detalhes estao em [backend/README.md](backend/README.md).

## Como rodar o frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite mostrara a URL local no terminal, normalmente:

```text
http://localhost:5173
```

## Rodando o projeto completo

1. Inicie o MySQL.
2. Rode o backend em `http://localhost:8000`.
3. Rode o frontend com `npm run dev`.
4. Acesse a URL indicada pelo Vite no navegador.
