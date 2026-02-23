import asyncpg
import os
from typing import Optional

DATABASE_URL = os.getenv("DATABASE_URL")


class Database:
    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(DATABASE_URL)
        print("✅ Connected to PostgreSQL")

    async def close(self):
        if self.pool:
            await self.pool.close()

    # =========================
    # USERS
    # =========================

    async def add_user(self, telegram_user_id: int):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO users (telegram_user_id)
                VALUES ($1)
                ON CONFLICT (telegram_user_id) DO NOTHING
            """, str(telegram_user_id))

    async def get_user(self, telegram_user_id: int):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow("""
                SELECT * FROM users
                WHERE telegram_user_id = $1
            """, str(telegram_user_id))

    async def set_vip(self, telegram_user_id: int):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                UPDATE users
                SET is_vip = TRUE,
                    updated_at = NOW()
                WHERE telegram_user_id = $1
            """, str(telegram_user_id))

    async def is_vip(self, telegram_user_id: int) -> bool:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT is_vip
                FROM users
                WHERE telegram_user_id = $1
            """, str(telegram_user_id))

            return row["is_vip"] if row else False