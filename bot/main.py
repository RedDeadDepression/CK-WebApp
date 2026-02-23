import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config.config import Config, load_config
from database.database import Database
import handlers

from keyboards.set_menu import set_main_menu


async def main():
    config: Config = load_config()

    bot = Bot(
        token = config.bot.token,
        default = DefaultBotProperties(parse_mode = ParseMode.HTML)
    )
    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)

    db = Database()
    await db.connect()
    dp["db"] = db


    await set_main_menu(bot)
    dp.include_router(handlers.user_router)
    dp.include_router(handlers.survey_router)

    await bot.delete_webhook(drop_pending_updates = True)
    await dp.start_polling(bot)

    await db.close()


if __name__ == "__main__":
    asyncio.run(main())
