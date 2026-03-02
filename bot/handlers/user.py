from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from database.database import Database
import keyboards
from services.common_utils import show_main_menu


user_router = Router()


@user_router.message(CommandStart())
async def process_start_command(message: Message, db: Database, state: FSMContext):
    await state.clear()

    user_id = message.from_user.id
    username = message.from_user.username
    full_name = " ".join(filter(None, [
        message.from_user.first_name,
        message.from_user.last_name
    ]))

    await db.add_user(
        telegram_user_id=user_id,
        full_name=full_name,
        username=username
    )

    survey_status = await db.is_survey_completed(
        telegram_user_id=user_id
    )

    await message.answer(
        "🏠 MAIN MENU",
        reply_markup=keyboards.get_main_menu_keyboard(survey_status)
    )


@user_router.callback_query(F.data == "my_stats_button_click")
async def process_my_stats_button_click(callback: CallbackQuery, db: Database):
    user_id = callback.from_user.id

    wins = await db.count_user_wins(telegram_user_id=user_id)
    attempts = await db.count_user_attempts(telegram_user_id=user_id)
    daily_cost = await db.get_daily_cost(telegram_user_id=user_id)

    # 💵 Saved money
    if daily_cost:
        saved_money = wins * (daily_cost / 20)
    else:
        saved_money = 0

    # 💪 Confidence
    attempts = attempts if attempts > 0 else 1
    confidence_text = f"{wins} wins out of {attempts} attempts"

    # ⏳ Saved time
    saved_time = wins * 4

    text = (
        f"💵 SAVED MONEY: ${saved_money:.2f} in unsmoked cigarettes\n\n"
        f"💪 CONFIDENCE TRACKER: {confidence_text}\n\n"
        f"⏳ SAVED TIME: {saved_time} minutes for any task"
    )

    await callback.message.edit_text(
        text,
        parse_mode="HTML",
        reply_markup=keyboards.back_to_main_menu_keyboard
    )


@user_router.callback_query(F.data == "my_stats_locked")
async def process_my_stats_locked(callback: CallbackQuery):
    await callback.answer(
        "First read How It Works 😉",
        show_alert=True
    )


@user_router.callback_query(F.data == "back_to_main_menu_button_click")
async def process_back_to_main_menu_button_click(callback: CallbackQuery, state: FSMContext, db: Database):
    await show_main_menu(callback, state, db=db)