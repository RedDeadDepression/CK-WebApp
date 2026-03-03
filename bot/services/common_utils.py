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

    await callback.message.edit_text(
        text,
        reply_markup = get_main_menu_keyboard(survey_status)
    )

    await callback.answer()
