from dataclasses import dataclass
from environs import Env
import os

ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "").split(",")]

@dataclass
class TgBot:
    token: str
    admin_ids: list[int]


@dataclass
class DatabaseConfig:
    database_url: str


@dataclass
class Config:
    bot: TgBot
    db: DatabaseConfig


def load_config(path: str | None = None) -> Config:
    env: Env = Env()
    env.read_env(path)

    return Config(
        bot=TgBot(
            token=env("BOT_TOKEN"),
            admin_ids=list(map(int, env.list("ADMIN_IDS")))
        ),
        db=DatabaseConfig(
            database_url=env("DATABASE_URL")
        )
    )
