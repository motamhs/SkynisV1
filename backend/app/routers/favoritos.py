from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.models import Favorito, Filme, Usuario
from app.schemas.schemas import FavoritoStatusOut, FilmeListOut, MsgOut

router = APIRouter(prefix="/favoritos", tags=["Favoritos"])


def _get_filme_or_404(db: Session, filme_id: int) -> Filme:
    filme = db.get(Filme, filme_id)
    if not filme:
        raise HTTPException(status_code=404, detail="Filme nao encontrado")
    return filme


def _get_favorito(db: Session, user_id: int, filme_id: int) -> Favorito | None:
    return (
        db.query(Favorito)
        .filter(Favorito.id_usuario == user_id, Favorito.id_filme == filme_id)
        .first()
    )


@router.get("", response_model=List[FilmeListOut])
def listar_favoritos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return (
        db.query(Filme)
        .join(Favorito, Favorito.id_filme == Filme.id_filme)
        .filter(Favorito.id_usuario == current_user.id_usuario)
        .order_by(Favorito.data_criacao.desc())
        .all()
    )


@router.get("/{filme_id}", response_model=FavoritoStatusOut)
def verificar_favorito(
    filme_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _get_filme_or_404(db, filme_id)
    return FavoritoStatusOut(
        favoritado=_get_favorito(db, current_user.id_usuario, filme_id) is not None
    )


@router.post("/{filme_id}", response_model=MsgOut, status_code=status.HTTP_201_CREATED)
def adicionar_favorito(
    filme_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _get_filme_or_404(db, filme_id)

    if _get_favorito(db, current_user.id_usuario, filme_id):
        return MsgOut(detail="Filme ja esta nos favoritos")

    db.add(Favorito(id_usuario=current_user.id_usuario, id_filme=filme_id))
    db.commit()
    return MsgOut(detail="Filme adicionado aos favoritos")


@router.delete("/{filme_id}", response_model=MsgOut)
def remover_favorito(
    filme_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    favorito = _get_favorito(db, current_user.id_usuario, filme_id)

    if not favorito:
        return MsgOut(detail="Filme nao estava nos favoritos")

    db.delete(favorito)
    db.commit()
    return MsgOut(detail="Filme removido dos favoritos")
