import asyncpg
from typing import Optional, List
from datetime import datetime

from config.config import load_config


class Database:
    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        config = load_config()

        self.pool = await asyncpg.create_pool(
            dsn=config.db.database_url,
            min_size=1,
            max_size=5,
        )

    async def close(self):
        if self.pool:
            await self.pool.close()

    # ================= USERS =================

    async def add_user(
        self,
        telegram_user_id: str,
        full_name: Optional[str],
        username: Optional[str],
    ):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO users (telegram_user_id, full_name, username)
                VALUES ($1, $2, $3)
                ON CONFLICT (telegram_user_id)
                DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    username = EXCLUDED.username,
                    updated_at = NOW()
                """,
                telegram_user_id,
                full_name,
                username,
            )

            await conn.execute(
                """
                INSERT INTO user_stats (telegram_user_id)
                VALUES ($1)
                ON CONFLICT (telegram_user_id) DO NOTHING
                """,
                telegram_user_id,
            )

    async def get_user(self, telegram_user_id: str):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(
                """
                SELECT * FROM users
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def set_vip(self, telegram_user_id: str):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET is_vip = true,
                    updated_at = NOW()
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def is_vip(self, telegram_user_id: str) -> bool:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT is_vip FROM users
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )
            return bool(row["is_vip"]) if row else False

    async def update_daily_cost(
        self,
        telegram_user_id: str,
        daily_cost: Optional[float],
    ):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET daily_cost = $1,
                    updated_at = NOW()
                WHERE telegram_user_id = $2
                """,
                daily_cost,
                telegram_user_id,
            )

    async def start_smoke_free(self, telegram_user_id: str):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET smoke_free_started_at = NOW(),
                    updated_at = NOW()
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def get_smoke_free_started_at(
        self, telegram_user_id: str
    ) -> Optional[datetime]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT smoke_free_started_at
                FROM users
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )
            return row["smoke_free_started_at"] if row else None

    # ================= USER STATS =================

    async def save_answer(
        self,
        telegram_user_id: str,
        question_id: int,
        answer_id: int,
    ):
        column_map = {
            1: "answer_id01",
            2: "answer_id02",
            3: "answer_id03",
            4: "answer_id04",
        }

        column = column_map.get(question_id)
        if not column:
            raise ValueError(f"Unknown question id: {question_id}")

        async with self.pool.acquire() as conn:
            await conn.execute(
                f"""
                UPDATE user_stats
                SET {column} = $1
                WHERE telegram_user_id = $2
                """,
                answer_id,
                telegram_user_id,
            )

    async def get_answer(
        self,
        telegram_user_id: str,
        question_id: int,
    ) -> Optional[int]:
        column_map = {
            1: "answer_id01",
            2: "answer_id02",
            3: "answer_id03",
            4: "answer_id04",
        }

        column = column_map.get(question_id)
        if not column:
            return None

        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                f"""
                SELECT {column}
                FROM user_stats
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

            return row[column] if row and row[column] is not None else None

    async def mark_survey_completed(self, telegram_user_id: str):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE user_stats
                SET survey_completed = true
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def is_survey_completed(self, telegram_user_id: str) -> bool:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT survey_completed
                FROM user_stats
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )
            return bool(row["survey_completed"]) if row else False

    async def mark_onboarding_completed(self, telegram_user_id: str):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE user_stats
                SET onboarding_completed = true
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def is_onboarding_completed(
        self, telegram_user_id: str
    ) -> bool:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT onboarding_completed
                FROM user_stats
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )
            return bool(row["onboarding_completed"]) if row else False

    # ================= WINS =================

    async def add_win(self, telegram_user_id: str):
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO wins (telegram_user_id)
                VALUES ($1)
                """,
                telegram_user_id,
            )

    async def get_user_wins(self, telegram_user_id: str) -> List[asyncpg.Record]:
        async with self.pool.acquire() as conn:
            return await conn.fetch(
                """
                SELECT * FROM wins
                WHERE telegram_user_id = $1
                ORDER BY created_at DESC
                """,
                telegram_user_id,
            )

    async def count_user_wins(self, telegram_user_id: str) -> int:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT COUNT(*) AS total
                FROM wins
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )
            return row["total"] if row else 0