from fastapi import APIRouter, Depends, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.models import Ator, Categoria, Diretor, Linguagem, Pais, Produtora
from app.schemas.schemas import AtorOut, CategoriaOut, DiretorOut, LinguagemOut, NomeCreate, PaisOut, PessoaCreate, ProdutoraOut

router = APIRouter(prefix="/dados", tags=["Dados auxiliares"])

def _buscar_por_nome(db: Session, model, nome: str):
    return db.query(model).filter(func.lower(model.nome) == nome.lower()).first()

@router.get("/paises", response_model=list[PaisOut])
def get_paises(db: Session = Depends(get_db)):
    return db.query(Pais).order_by(Pais.nome).all()

@router.post("/paises", response_model=PaisOut, status_code=status.HTTP_201_CREATED)
def criar_pais(
    body: NomeCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    existente = _buscar_por_nome(db, Pais, body.nome)
    if existente:
        return existente

    pais = Pais(nome=body.nome)
    db.add(pais)
    db.commit()
    db.refresh(pais)
    return pais

@router.get("/categorias", response_model=list[CategoriaOut])
def get_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.nome).all()

@router.post("/categorias", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED)
def criar_categoria(
    body: NomeCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    existente = _buscar_por_nome(db, Categoria, body.nome)
    if existente:
        return existente

    categoria = Categoria(nome=body.nome)
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria

@router.get("/linguagens", response_model=list[LinguagemOut])
def get_linguagens(db: Session = Depends(get_db)):
    return db.query(Linguagem).order_by(Linguagem.nome).all()

@router.post("/linguagens", response_model=LinguagemOut, status_code=status.HTTP_201_CREATED)
def criar_linguagem(
    body: NomeCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    existente = _buscar_por_nome(db, Linguagem, body.nome)
    if existente:
        return existente

    linguagem = Linguagem(nome=body.nome)
    db.add(linguagem)
    db.commit()
    db.refresh(linguagem)
    return linguagem

@router.get("/produtoras", response_model=list[ProdutoraOut])
def get_produtoras(db: Session = Depends(get_db)):
    return db.query(Produtora).order_by(Produtora.nome).all()

@router.post("/produtoras", response_model=ProdutoraOut, status_code=status.HTTP_201_CREATED)
def criar_produtora(
    body: NomeCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    existente = _buscar_por_nome(db, Produtora, body.nome)
    if existente:
        return existente

    produtora = Produtora(nome=body.nome)
    db.add(produtora)
    db.commit()
    db.refresh(produtora)
    return produtora

@router.get("/atores", response_model=list[AtorOut])
def get_atores(db: Session = Depends(get_db)):
    return db.query(Ator).order_by(Ator.sobrenome).all()

@router.post("/atores", response_model=AtorOut, status_code=status.HTTP_201_CREATED)
def criar_ator(
    body: PessoaCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    existente = _buscar_por_nome(db, Ator, body.nome)
    if existente:
        return existente

    ator = Ator(nome=body.nome, sobrenome=body.sobrenome, foto=body.foto)
    db.add(ator)
    db.commit()
    db.refresh(ator)
    return ator

@router.get("/diretores", response_model=list[DiretorOut])
def get_diretores(db: Session = Depends(get_db)):
    return db.query(Diretor).order_by(Diretor.sobrenome).all()

@router.post("/diretores", response_model=DiretorOut, status_code=status.HTTP_201_CREATED)
def criar_diretor(
    body: PessoaCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    existente = _buscar_por_nome(db, Diretor, body.nome)
    if existente:
        return existente

    diretor = Diretor(nome=body.nome, sobrenome=body.sobrenome)
    db.add(diretor)
    db.commit()
    db.refresh(diretor)
    return diretor
