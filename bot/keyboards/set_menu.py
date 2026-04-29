from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeChat

from lexicon.lexicon_en import LEXICON_COMMANDS_EN


async def set_main_menu(bot: Bot, config):

    main_menu_commands = [
        BotCommand(command=command, description=description)
        for command, description in LEXICON_COMMANDS_EN.items()
    ]

    # Общие команды
    await bot.set_my_commands(
        main_menu_commands,
        scope=BotCommandScopeDefault()
    )

    # Админ-команды
    admin_commands = main_menu_commands + [
        BotCommand(command="reset_me", description="Reset my data")
    ]

    for admin_id in config.bot.admin_ids:
        try:
            await bot.set_my_commands(
                admin_commands,
                scope=BotCommandScopeChat(chat_id=admin_id)
            )
        except Exception as e:
            print(f"Failed to set admin commands for {admin_id}: {e}")