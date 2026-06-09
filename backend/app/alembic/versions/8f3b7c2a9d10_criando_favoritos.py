"""criando favoritos

Revision ID: 8f3b7c2a9d10
Revises: 57a9ef6bf842
Create Date: 2026-06-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8f3b7c2a9d10"
down_revision: Union[str, Sequence[str], None] = "57a9ef6bf842"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "favorito",
        sa.Column("id_favorito", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_filme", sa.Integer(), nullable=False),
        sa.Column("data_criacao", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["id_filme"], ["filme.id_filme"]),
        sa.ForeignKeyConstraint(["id_usuario"], ["usuario.id_usuario"]),
        sa.PrimaryKeyConstraint("id_favorito"),
        sa.UniqueConstraint("id_usuario", "id_filme", name="uq_favorito_usuario_filme"),
    )


def downgrade() -> None:
    op.drop_table("favorito")
