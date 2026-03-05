from aiogram.types import CallbackQuery
from aiogram.fsm.context import FSMContext

from keyboards.keyboards import get_main_menu_keyboard

from datetime import datetime, timezone


async def show_main_menu(
        callback: CallbackQuery,
        state: FSMContext,
        *,
        clear_state: bool = True,
        text: str = "🏠 MAIN MENU",
        db
) -> None:

    user_id = callback.from_user.id
    survey_status = await db.is_survey_completed(user_id)

    if clear_state:
        await state.clear()

    message = callback.message

    # если текущее сообщение фото или caption
    if message.photo or message.caption:
        await message.delete()

        await callback.bot.send_message(
            chat_id=message.chat.id,
            text=text,
            reply_markup=get_main_menu_keyboard(survey_status)
        )

    # если обычное текстовое сообщение
    else:
        try:
            await message.edit_text(
                text,
                reply_markup=get_main_menu_keyboard(survey_status)
            )
        except Exception:
            # fallback если edit невозможен
            await message.delete()
            await callback.bot.send_message(
                chat_id=message.chat.id,
                text=text,
                reply_markup=get_main_menu_keyboard(survey_status)
            )

    await callback.answer()