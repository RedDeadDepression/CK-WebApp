from aiogram import F, Router
from aiogram.filters import CommandStart, Command
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from database.database import Database
import keyboards
from services.common_utils import show_main_menu

import json


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
    telegram_user_id = callback.from_user.id

    wins = await db.count_user_wins(telegram_user_id)
    attempts = await db.count_user_attempts(telegram_user_id)
    daily_cost = await db.get_daily_cost(telegram_user_id)

    # 💵 Money
    if daily_cost:
        saved_money = wins * (daily_cost / 20)
    else:
        saved_money = 0

    # 💪 Confidence + message
    if attempts == 0:
        confidence_text = "No attempts yet"
        motivation_text = "Start your first step — you’ve got this 💪"
    else:
        success_rate = int((wins / attempts) * 100)
        confidence_text = f"{wins} wins out of {attempts} attempts ({success_rate}%)"

        # 🎯 Психология
        if success_rate < 30:
            motivation_text = "Every attempt counts. You're building awareness — keep going."
        elif success_rate < 60:
            motivation_text = "You're getting stronger. Keep pushing forward."
        elif success_rate < 85:
            motivation_text = "Great progress. You're taking control."
        else:
            motivation_text = "You're in full control. This is a strong habit already 🔥"

    # ⏳ Time
    saved_time = wins * 4

    text = (
        f"📊 <b>Your Progress</b>\n\n"
        f"💪 <b>Confidence:</b> {confidence_text}\n"
        f"🧠 <i>{motivation_text}</i>\n\n"
        f"💵 <b>Saved:</b> ${saved_money:.2f}\n"
        f"⏳ <b>Time gained:</b> {saved_time} minutes\n"
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

@user_router.message(Command("reset_me"))
async def reset_me_handler(message: Message, db: Database, config):

    if message.from_user.id not in config.bot.admin_ids:
        await message.answer("You are not allowed to use this command.")
        return

    await db.delete_user(message.from_user.id)

    await message.answer("Your data has been reset.")


@user_router.message(F.web_app_data)
async def handle_webapp_data(message: Message, db: Database):
    try:
        print("WEBAPP DATA RAW:", message.web_app_data.data)

        data = json.loads(message.web_app_data.data)

        print("PARSED:", data)

        if data.get("action") == "win_recorded":
            user_id = message.from_user.id

            await db.create_win(user_id)

            print(f"WIN SAVED for {user_id}")

    except Exception as e:
        print("WEBAPP ERROR:", e)