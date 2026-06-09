"""criando solicitacoes edicao

Revision ID: 1c4b2e7a6f90
Revises: 8f3b7c2a9d10
Create Date: 2026-06-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1c4b2e7a6f90"
down_revision: Union[str, Sequence[str], None] = "8f3b7c2a9d10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "solicitacao_edicao_filme",
        sa.Column("id_solicitacao", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_filme", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("dados", sa.JSON(), nullable=False),
        sa.Column("status", sa.Enum("pendente", "aprovada", "rejeitada"), nullable=False),
        sa.Column("data_criacao", sa.DateTime(), nullable=True),
        sa.Column("data_decisao", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["id_filme"], ["filme.id_filme"]),
        sa.ForeignKeyConstraint(["id_usuario"], ["usuario.id_usuario"]),
        sa.PrimaryKeyConstraint("id_solicitacao"),
    )


def downgrade() -> None:
    op.drop_table("solicitacao_edicao_filme")
