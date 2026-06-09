"""criando solicitacoes adicao

Revision ID: 6b8d12e4a9f3
Revises: 4d2f8b91c3a7
Create Date: 2026-06-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6b8d12e4a9f3"
down_revision: Union[str, Sequence[str], None] = "4d2f8b91c3a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "solicitacao_adicao_filme",
        sa.Column("id_solicitacao", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_filme", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("status", sa.Enum("pendente", "aprovada", "rejeitada"), nullable=False),
        sa.Column("data_criacao", sa.DateTime(), nullable=True),
        sa.Column("data_decisao", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["id_filme"], ["filme.id_filme"]),
        sa.ForeignKeyConstraint(["id_usuario"], ["usuario.id_usuario"]),
        sa.PrimaryKeyConstraint("id_solicitacao"),
        sa.UniqueConstraint("id_filme", name="uq_solicitacao_adicao_filme"),
    )


def downgrade() -> None:
    op.drop_table("solicitacao_adicao_filme")
