from datetime import time as dt_time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.models import (
    Ator, AvaliacaoFilme, Categoria, Diretor, Favorito, Filme, FilmeAtor, FilmeCategoria,
    FilmeDiretor, FilmeLinguagem, FilmePais, FilmeProdutora,
    Linguagem, Pais, Produtora, SolicitacaoAdicaoFilme, SolicitacaoEdicaoFilme, Usuario,
)
from app.schemas.schemas import (
    AvaliacaoFilmeIn, AvaliacaoFilmeOut, FilmeComAvaliacaoOut, FilmeCreate, FilmeListOut, FilmeOut, FilmeUpdate, MsgOut,
    SolicitacaoAdicaoFilmeOut, SolicitacaoEdicaoFilmeCreate, SolicitacaoEdicaoFilmeOut,
)

router = APIRouter(prefix="/filmes", tags=["Filmes"])

# ─── helpers ──────────────────────────────────────────────────────────────────

def _parse_duracao(s: Optional[str]) -> Optional[dt_time]:
    if not s:
        return None
    parts = s.split(":")
    try:
        h, m = int(parts[0]), int(parts[1])
        sec = int(parts[2]) if len(parts) > 2 else 0
        return dt_time(h, m, sec)
    except Exception:
        raise HTTPException(status_code=422, detail=f"Formato de duração inválido: '{s}'. Use HH:MM ou HH:MM:SS")

def _set_relations(db: Session, filme: Filme, data: dict):
    """Atualiza todas as tabelas N:N do filme."""
    mapping = {
        "ids_produtoras": (FilmeProdutora, "id_produtora"),
        "ids_paises":     (FilmePais,      "id_pais"),
        "ids_categorias": (FilmeCategoria, "id_categoria"),
        "ids_atores":     (FilmeAtor,      "id_ator"),
        "ids_diretores":  (FilmeDiretor,   "id_diretor"),
        "ids_linguagens": (FilmeLinguagem, "id_linguagem"),
    }
    fk_filme = "id_filme"

    for key, (Model, fk_col) in mapping.items():
        ids = data.get(key)
        if ids is None:
            continue
        # remove registros antigos
        db.query(Model).filter(getattr(Model, fk_filme) == filme.id_filme).delete()
        for fk_id in ids:
            db.add(Model(**{fk_filme: filme.id_filme, fk_col: fk_id}))

def _get_or_404(db: Session, filme_id: int) -> Filme:
    f = db.get(Filme, filme_id)
    if not f:
        raise HTTPException(status_code=404, detail="Filme não encontrado")
    return f

# ─── Rotas públicas ───────────────────────────────────────────────────────────

def _aplicar_edicao_filme(db: Session, filme: Filme, data: dict):
    scalar_fields = {"titulo", "orcamento", "sinopse", "ano", "poster", "banner", "trailer", "id_produtora_principal"}
    for field in scalar_fields:
        if field in data:
            setattr(filme, field, data[field])

    if "duracao" in data:
        filme.duracao = _parse_duracao(data["duracao"])

    _set_relations(db, filme, data)

def _resumo_avaliacao(db: Session, filme_id: int, user_id: Optional[int] = None) -> AvaliacaoFilmeOut:
    total, media = (
        db.query(func.count(AvaliacaoFilme.id_avaliacao), func.avg(AvaliacaoFilme.nota))
        .filter(AvaliacaoFilme.id_filme == filme_id)
        .one()
    )
    nota_usuario = None

    if user_id is not None:
        avaliacao = (
            db.query(AvaliacaoFilme)
            .filter(AvaliacaoFilme.id_filme == filme_id, AvaliacaoFilme.id_usuario == user_id)
            .first()
        )
        nota_usuario = avaliacao.nota if avaliacao else None

    return AvaliacaoFilmeOut(
        nota_usuario=nota_usuario,
        media=round(float(media or 0), 1),
        total=int(total or 0),
    )

def _filme_com_avaliacao(db: Session, filme: Filme) -> FilmeComAvaliacaoOut:
    resumo = _resumo_avaliacao(db, filme.id_filme)
    return FilmeComAvaliacaoOut(filme=filme, media=resumo.media, total=resumo.total)

@router.get("", response_model=List[FilmeListOut])
def list_filmes(
    titulo: Optional[str] = Query(None, description="Busca por título"),
    ano: Optional[int] = Query(None),
    categoria: Optional[int] = Query(None, description="id_categoria"),
    ator: Optional[int] = Query(None, description="id_ator"),
    diretor: Optional[int] = Query(None, description="id_diretor"),
    pais: Optional[int] = Query(None, description="id_pais"),
    aprovados: bool = Query(True, description="False = pendentes (só admin)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Filme)

    q = q.filter(Filme.flag == True)

    if titulo:
        q = q.filter(Filme.titulo.ilike(f"%{titulo}%"))
    if ano:
        q = q.filter(Filme.ano == ano)
    if categoria:
        q = q.join(FilmeCategoria, FilmeCategoria.id_filme == Filme.id_filme).filter(
            FilmeCategoria.id_categoria == categoria
        )
    if ator:
        q = q.join(FilmeAtor, FilmeAtor.id_filme == Filme.id_filme).filter(
            FilmeAtor.id_ator == ator
        )
    if diretor:
        q = q.join(FilmeDiretor, FilmeDiretor.id_filme == Filme.id_filme).filter(
            FilmeDiretor.id_diretor == diretor
        )
    if pais:
        q = q.join(FilmePais, FilmePais.id_filme == Filme.id_filme).filter(
            FilmePais.id_pais == pais
        )

    return q.offset(skip).limit(limit).all()

@router.get("/rankings/melhores", response_model=List[FilmeComAvaliacaoOut])
def list_melhores_classificados(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    ranking = (
        db.query(
            Filme.id_filme,
            func.coalesce(func.avg(AvaliacaoFilme.nota), 0).label("media"),
            func.count(AvaliacaoFilme.id_avaliacao).label("total"),
            func.max(Filme.ano).label("ano_rank"),
        )
        .outerjoin(AvaliacaoFilme, AvaliacaoFilme.id_filme == Filme.id_filme)
        .filter(Filme.flag == True)
        .group_by(Filme.id_filme)
        .order_by(func.coalesce(func.avg(AvaliacaoFilme.nota), 0).desc(), func.count(AvaliacaoFilme.id_avaliacao).desc(), func.max(Filme.ano).desc())
        .limit(limit)
        .all()
    )
    filmes_por_id = {
        filme.id_filme: filme
        for filme in db.query(Filme).filter(Filme.id_filme.in_([item.id_filme for item in ranking])).all()
    }
    return [
        FilmeComAvaliacaoOut(
            filme=filmes_por_id[item.id_filme],
            media=round(float(item.media or 0), 1),
            total=int(item.total or 0),
        )
        for item in ranking
        if item.id_filme in filmes_por_id
    ]

@router.get("/rankings/novidades", response_model=List[FilmeComAvaliacaoOut])
def list_novidades(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    filmes = (
        db.query(Filme)
        .filter(Filme.flag == True)
        .order_by(Filme.ano.desc(), Filme.id_filme.desc())
        .limit(limit)
        .all()
    )
    return [_filme_com_avaliacao(db, filme) for filme in filmes]

@router.get("/pendentes", response_model=List[FilmeListOut])
def list_pendentes(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    return db.query(Filme).filter(Filme.flag == False).all()


@router.get("/minhas-adicoes", response_model=List[SolicitacaoAdicaoFilmeOut])
def list_minhas_adicoes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(SolicitacaoAdicaoFilme)
        .filter(SolicitacaoAdicaoFilme.id_usuario == current_user.id_usuario)
        .order_by(SolicitacaoAdicaoFilme.data_criacao.desc())
        .all()
    )


@router.get("/edicoes/pendentes", response_model=List[SolicitacaoEdicaoFilmeOut])
def list_edicoes_pendentes(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    return (
        db.query(SolicitacaoEdicaoFilme)
        .filter(SolicitacaoEdicaoFilme.status == "pendente")
        .order_by(SolicitacaoEdicaoFilme.data_criacao.desc())
        .all()
    )


@router.get("/edicoes/minhas", response_model=List[SolicitacaoEdicaoFilmeOut])
def list_minhas_edicoes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(SolicitacaoEdicaoFilme)
        .filter(SolicitacaoEdicaoFilme.id_usuario == current_user.id_usuario)
        .order_by(SolicitacaoEdicaoFilme.data_criacao.desc())
        .all()
    )


@router.get("/{filme_id}", response_model=FilmeOut)
def get_filme(filme_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, filme_id)

# ─── Rotas autenticadas ───────────────────────────────────────────────────────

@router.post("", response_model=FilmeOut, status_code=201)
def create_filme(
    body: FilmeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    data = body.model_dump()
    filme = Filme(
        titulo=data["titulo"],
        id_produtora_principal=data.get("id_produtora_principal"),
        orcamento=data.get("orcamento"),
        duracao=_parse_duracao(data.get("duracao")),
        sinopse=data.get("sinopse"),
        ano=data.get("ano"),
        poster=data.get("poster"),
        banner=data.get("banner"),
        trailer=data.get("trailer"),
        flag=current_user.role == "admin",
    )
    db.add(filme)
    db.flush()  # obtém id_filme antes do commit
    db.add(SolicitacaoAdicaoFilme(
        id_filme=filme.id_filme,
        id_usuario=current_user.id_usuario,
        status="aprovada" if current_user.role == "admin" else "pendente",
        data_decisao=func.now() if current_user.role == "admin" else None,
    ))

    _set_relations(db, filme, data)
    db.commit()
    db.refresh(filme)
    return filme

@router.patch("/{filme_id}", response_model=FilmeOut)
def update_filme(
    filme_id: int,
    body: FilmeUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    filme = _get_or_404(db, filme_id)
    data = body.model_dump(exclude_none=True)

    _aplicar_edicao_filme(db, filme, data)
    db.commit()
    db.refresh(filme)
    return filme

@router.get("/{filme_id}/avaliacao", response_model=AvaliacaoFilmeOut)
def get_avaliacao_filme(
    filme_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _get_or_404(db, filme_id)
    return _resumo_avaliacao(db, filme_id, current_user.id_usuario)

@router.put("/{filme_id}/avaliacao", response_model=AvaliacaoFilmeOut)
def salvar_avaliacao_filme(
    filme_id: int,
    body: AvaliacaoFilmeIn,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _get_or_404(db, filme_id)
    avaliacao = (
        db.query(AvaliacaoFilme)
        .filter(AvaliacaoFilme.id_filme == filme_id, AvaliacaoFilme.id_usuario == current_user.id_usuario)
        .first()
    )

    if avaliacao:
        avaliacao.nota = body.nota
    else:
        db.add(AvaliacaoFilme(
            id_filme=filme_id,
            id_usuario=current_user.id_usuario,
            nota=body.nota,
        ))

    db.commit()
    return _resumo_avaliacao(db, filme_id, current_user.id_usuario)

@router.post("/{filme_id}/solicitar-edicao", response_model=SolicitacaoEdicaoFilmeOut, status_code=status.HTTP_201_CREATED)
def solicitar_edicao_filme(
    filme_id: int,
    body: SolicitacaoEdicaoFilmeCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _get_or_404(db, filme_id)
    dados = body.dados.model_dump(exclude_none=True, mode="json")

    if not dados:
        raise HTTPException(status_code=400, detail="Nenhuma alteracao enviada")

    solicitacao = SolicitacaoEdicaoFilme(
        id_filme=filme_id,
        id_usuario=current_user.id_usuario,
        dados=dados,
    )
    db.add(solicitacao)
    db.commit()
    db.refresh(solicitacao)
    return solicitacao

@router.put("/edicoes/{solicitacao_id}/aprovar", response_model=FilmeOut)
def aprovar_edicao_filme(
    solicitacao_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    solicitacao = db.get(SolicitacaoEdicaoFilme, solicitacao_id)
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitacao de edicao nao encontrada")
    if solicitacao.status != "pendente":
        raise HTTPException(status_code=400, detail="Solicitacao ja analisada")

    filme = _get_or_404(db, solicitacao.id_filme)
    _aplicar_edicao_filme(db, filme, solicitacao.dados)
    solicitacao.status = "aprovada"
    solicitacao.data_decisao = func.now()
    db.commit()
    db.refresh(filme)
    return filme

@router.put("/edicoes/{solicitacao_id}/rejeitar", response_model=MsgOut)
def rejeitar_edicao_filme(
    solicitacao_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    solicitacao = db.get(SolicitacaoEdicaoFilme, solicitacao_id)
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitacao de edicao nao encontrada")
    if solicitacao.status != "pendente":
        raise HTTPException(status_code=400, detail="Solicitacao ja analisada")

    solicitacao.status = "rejeitada"
    solicitacao.data_decisao = func.now()
    db.commit()
    return MsgOut(detail="Solicitacao de edicao rejeitada")

@router.put("/{filme_id}/aprovar", response_model=FilmeOut)
def aprovar_filme(
    filme_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    filme = _get_or_404(db, filme_id)
    filme.flag = True
    solicitacao = (
        db.query(SolicitacaoAdicaoFilme)
        .filter(SolicitacaoAdicaoFilme.id_filme == filme_id)
        .first()
    )
    if solicitacao:
        solicitacao.status = "aprovada"
        solicitacao.data_decisao = func.now()
    db.commit()
    db.refresh(filme)
    return filme

@router.delete("/{filme_id}", response_model=MsgOut)
def delete_filme(
    filme_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    filme = _get_or_404(db, filme_id)
    # remove relações antes de deletar o filme
    for Model in (FilmeProdutora, FilmePais, FilmeCategoria, FilmeAtor, FilmeDiretor, FilmeLinguagem, Favorito, AvaliacaoFilme, SolicitacaoAdicaoFilme, SolicitacaoEdicaoFilme):
        db.query(Model).filter(Model.id_filme == filme_id).delete()
    db.delete(filme)
    db.commit()
    return MsgOut(detail="Filme removido com sucesso")
