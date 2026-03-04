from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeChat

from lexicon.lexicon_en import LEXICON_COMMANDS_EN

from config import ADMIN_IDS

async def set_main_menu(bot: Bot):

    # Общие команды
    main_menu_commands = [
        BotCommand(command=command, description=description)
        for command, description in LEXICON_COMMANDS_EN.items()
    ]

    await bot.set_my_commands(
        main_menu_commands,
        scope=BotCommandScopeDefault()
    )

    # 🔥 Команда только для админа
    admin_commands = main_menu_commands + [
        BotCommand(command="reset_me", description="Reset my data (admin)")
    ]

    for admin_id in ADMIN_IDS:
        await bot.set_my_commands(
            admin_commands,
            scope=BotCommandScopeChat(chat_id=admin_id)
        )

    await bot.set_my_commands(main_menu_commands)