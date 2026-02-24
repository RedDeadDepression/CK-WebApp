import asyncpg
from typing import Optional, List
from datetime import datetime
from environs import Env


class Database:
    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    # ================= CONNECTION =================

    async def connect(self):
        env = Env()
        env.read_env()

        database_url = env("DATABASE_URL")

        self.pool = await asyncpg.create_pool(
            dsn=database_url,
            min_size=1,
            max_size=5,
        )

    async def close(self):
        if self.pool:
            await self.pool.close()

    def _normalize_id(self, telegram_user_id: int | str) -> str:
        """Всегда приводим telegram_user_id к строке"""
        return str(telegram_user_id)

    # ================= USERS =================

    async def add_user(
        self,
        telegram_user_id: int | str,
        full_name: Optional[str],
        username: Optional[str],
    ):
        telegram_user_id = self._normalize_id(telegram_user_id)

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

    async def get_user(self, telegram_user_id: int | str):
        telegram_user_id = self._normalize_id(telegram_user_id)

        async with self.pool.acquire() as conn:
            return await conn.fetchrow(
                """
                SELECT * FROM users
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def set_vip(self, telegram_user_id: int | str):
        telegram_user_id = self._normalize_id(telegram_user_id)

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

    async def is_vip(self, telegram_user_id: int | str) -> bool:
        telegram_user_id = self._normalize_id(telegram_user_id)

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
        telegram_user_id: int | str,
        daily_cost: Optional[float],
    ):
        telegram_user_id = self._normalize_id(telegram_user_id)

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

    async def start_smoke_free(self, telegram_user_id: int | str):
        telegram_user_id = self._normalize_id(telegram_user_id)

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
        self, telegram_user_id: int | str
    ) -> Optional[datetime]:
        telegram_user_id = self._normalize_id(telegram_user_id)

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
        telegram_user_id: int | str,
        question_id: int,
        answer_id: int,
    ):
        telegram_user_id = self._normalize_id(telegram_user_id)

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

    async def mark_survey_completed(self, telegram_user_id: int | str):
        telegram_user_id = self._normalize_id(telegram_user_id)

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE user_stats
                SET survey_completed = true
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    async def mark_onboarding_completed(self, telegram_user_id: int | str):
        telegram_user_id = self._normalize_id(telegram_user_id)

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE user_stats
                SET onboarding_completed = true
                WHERE telegram_user_id = $1
                """,
                telegram_user_id,
            )

    # ================= WINS =================

    async def add_win(self, telegram_user_id: int | str):
        telegram_user_id = self._normalize_id(telegram_user_id)

        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO wins (telegram_user_id)
                VALUES ($1)
                """,
                telegram_user_id,
            )

    async def get_user_wins(self, telegram_user_id: int | str) -> List[asyncpg.Record]:
        telegram_user_id = self._normalize_id(telegram_user_id)

        async with self.pool.acquire() as conn:
            return await conn.fetch(
                """
                SELECT *
                FROM wins
                WHERE telegram_user_id = $1
                ORDER BY created_at DESC
                """,
                telegram_user_id,
            )

    async def count_user_wins(self, telegram_user_id: int | str) -> int:
        telegram_user_id = self._normalize_id(telegram_user_id)

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