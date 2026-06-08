from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.models import RefreshTokenBlacklist, Usuario
from app.schemas.schemas import LoginIn, MsgOut, RefreshIn, TokenOut, UsuarioCreate, UsuarioOut

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UsuarioOut, status_code=201)
def register(body: UsuarioCreate, db: Session = Depends(get_db)):
    email = str(body.email).strip().lower()
    apelido = body.apelido.strip()

    if db.query(Usuario).filter(func.lower(Usuario.email) == email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    if db.query(Usuario).filter(func.lower(Usuario.apelido) == apelido.lower()).first():
        raise HTTPException(status_code=400, detail="Nome de usuário já cadastrado")

    user = Usuario(
        nome=body.nome.strip(),
        sobrenome=body.sobrenome,
        apelido=apelido,
        email=email,
        senha=hash_password(body.senha),
        data_nascimento=body.data_nascimento,
        imagem=body.imagem,
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    login_id = body.email.strip()
    login_id_normalizado = login_id.lower()
    user = (
        db.query(Usuario)
        .filter(
            or_(
                func.lower(Usuario.email) == login_id_normalizado,
                func.lower(Usuario.apelido) == login_id_normalizado,
            )
        )
        .first()
    )
    if not user or not verify_password(body.senha, user.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    return TokenOut(
        access_token=create_access_token(user.id_usuario, user.role),
        refresh_token=create_refresh_token(user.id_usuario),
    )

@router.post("/refresh", response_model=TokenOut)
def refresh(body: RefreshIn, db: Session = Depends(get_db)):
    # Verifica blacklist
    if db.query(RefreshTokenBlacklist).filter_by(token=body.refresh_token).first():
        raise HTTPException(status_code=401, detail="Refresh token revogado")

    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    user_id = int(payload["sub"])
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Invalida o refresh token atual (rotação)
    db.add(RefreshTokenBlacklist(token=body.refresh_token))
    db.commit()

    return TokenOut(
        access_token=create_access_token(user.id_usuario, user.role),
        refresh_token=create_refresh_token(user.id_usuario),
    )

@router.post("/logout", response_model=MsgOut)
def logout(body: RefreshIn, db: Session = Depends(get_db)):
    if not db.query(RefreshTokenBlacklist).filter_by(token=body.refresh_token).first():
        db.add(RefreshTokenBlacklist(token=body.refresh_token))
        db.commit()
    return MsgOut(detail="Logout realizado com sucesso")
