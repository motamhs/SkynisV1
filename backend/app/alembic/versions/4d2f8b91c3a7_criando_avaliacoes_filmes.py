"""criando avaliacoes filmes

Revision ID: 4d2f8b91c3a7
Revises: 1c4b2e7a6f90
Create Date: 2026-06-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4d2f8b91c3a7"
down_revision: Union[str, Sequence[str], None] = "1c4b2e7a6f90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "avaliacao_filme",
        sa.Column("id_avaliacao", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_filme", sa.Integer(), nullable=False),
        sa.Column("nota", sa.Integer(), nullable=False),
        sa.Column("data_criacao", sa.DateTime(), nullable=True),
        sa.Column("data_atualizacao", sa.DateTime(), nullable=True),
        sa.CheckConstraint("nota >= 0 AND nota <= 5", name="ck_avaliacao_filme_nota"),
        sa.ForeignKeyConstraint(["id_filme"], ["filme.id_filme"]),
        sa.ForeignKeyConstraint(["id_usuario"], ["usuario.id_usuario"]),
        sa.PrimaryKeyConstraint("id_avaliacao"),
        sa.UniqueConstraint("id_usuario", "id_filme", name="uq_avaliacao_usuario_filme"),
    )


def downgrade() -> None:
    op.drop_table("avaliacao_filme")
