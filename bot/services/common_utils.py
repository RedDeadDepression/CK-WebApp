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

async def money_tracker(db, user_id: int) -> float:
    user = await db.get_user(user_id)
    if not user:
        raise ValueError("User not found")

    joined_at_str = user[4]
    daily_cost = user[5]

    if not joined_at_str:
        raise ValueError("Registration date not set")

    if daily_cost is None:
        raise ValueError("Daily cost is not calculated yet")

    joined_at = datetime.fromisoformat(joined_at_str)
    delta_days = (datetime.now() - joined_at).days

    profit = delta_days * daily_cost

    return round(profit, 2)

async def smoke_free_tracker(db, user_id: int) -> dict:
    started_at_str = await db.get_smoke_free_started_at(user_id)

    if not started_at_str:
        raise ValueError("Smoke-free timer has not been started yet.")

    started_at_utc = datetime.fromisoformat(started_at_str).replace(tzinfo=timezone.utc)
    now_utc = datetime.now(timezone.utc)

    delta = now_utc - started_at_utc

    days = delta.days
    hours, remainder = divmod(delta.seconds, 3600)
    minutes, _ = divmod(remainder, 60)

    return {
        "days": days,
        "hours": hours,
        "minutes": minutes,
        "total_seconds": int(delta.total_seconds())
    }

async def confidence_tracker(db, user_id: int):
    return "WORK IN PROGRESS"