from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from lexicon.lexicon_en import LEXICON_EN
from database.database import Database
import keyboards
from services.common_utils import show_main_menu, confidence_tracker, money_tracker, smoke_free_tracker


user_router = Router()

@user_router.message(CommandStart())
async def process_start_command(message: Message, db: Database, state: FSMContext):
    await state.clear()

    user_id = message.from_user.id
    username = message.from_user.username
    full_name = " ".join(filter(None, [
        message.from_user.first_name,
        message.from_user.last_name
        ])
    )

    await db.add_user(user_id, full_name, username)

    survey_status = await db.is_survey_completed(user_id)

    await message.answer(
        "🏠 MAIN MENU",
        reply_markup=keyboards.get_main_menu_keyboard(survey_status)
    )


@user_router.callback_query(F.data == "my_stats_button_click")
async def process_my_stats_button_click(callback: CallbackQuery, db: Database):
    user_id = callback.from_user.id

    try:
        confidence = await confidence_tracker(db, user_id)
        profit = await money_tracker(db, user_id)
        try:
            smoke_free_time = await smoke_free_tracker(db, user_id)
            smoke_free_text = ""
        except ValueError:
            smoke_free_time = {"days": 0, "hours": 0, "minutes": 0}
            smoke_free_text = "⚠️ Timer not started. Press ▶️ Start / Restart timer in 🌬️ <b>SMOKE FREE TRACKER</b>"
    except ValueError as e:
        await callback.message.edit_text(f"⚠️ {str(e)}")
        return

    text = (
        f"📈 <u><b>MY STATS</b></u>\n\n"
        f"💪 <b>CONFIDENCE TRACKER</b>\n"
        f"Your confidence level is {confidence}\n"
        "-------------------------\n\n"
        f"💰 <b>MONEY TRACKER</b>\n"
        f"💸 Since you joined, you could have saved approximately ${profit:,} without smoking.\n"
        "-------------------------\n\n"
        f"🌬️ <b>SMOKE FREE TRACKER</b>\n"
        f"🚭 Your are smoke-free for:\n🗓 {smoke_free_time['days']} days, ⏰ {smoke_free_time['hours']} hours, {smoke_free_time['minutes']} minutes!\n"
        f"{smoke_free_text}"
    )

    await callback.message.edit_text(
        text,
        parse_mode = "HTML",
        reply_markup = keyboards.back_to_main_menu_keyboard
    )

@user_router.callback_query(F.data == "my_stats_locked")
async def process_my_stats_locked(callback: CallbackQuery):
    await callback.answer(
        "First read How It Works 😉",
        show_alert = True
    )

@user_router.callback_query(F.data == "money_tracker_button_click")
async def process_money_tracker_button_click(callback: CallbackQuery, db: Database):
    user_id = callback.from_user.id

    try:
        profit = await money_tracker(db, user_id)
        text = f'💸 Since you joined, you could have saved approximately ${profit:,} without smoking.'

    except ValueError as e:
        text = f"⚠️ {str(e)}"

    await callback.message.edit_text(
        text,
        reply_markup = keyboards.back_to_my_profile_keyboard
    )
    await callback.answer()

@user_router.callback_query(F.data == "smoke_free_tracker_button_click")
async def process_smoke_free_tracker_button_click(callback: CallbackQuery, db: Database):
    user_id = callback.from_user.id

    try:
        data = await smoke_free_tracker(db, user_id)

        text = (
            "🚭 <b>You are smoke-free for:</b>\n\n"
            f"🗓 {data['days']} days\n"
            f"⏰ {data['hours']} hours {data['minutes']} minutes\n\n"
            "Keep going 💪"
        )

    except ValueError:
        text = (
            "⏱ You haven't started the smoke-free timer yet.\n\n"
            "Press the button below to start."
        )

    await callback.message.edit_text(
        text,
        reply_markup = keyboards.smoke_free_tracker_keyboard,
        parse_mode = "HTML"
    )
    await callback.answer()

@user_router.callback_query(F.data == "start_smoke_free_timer_button_click")
async def process_start_smoke_free_timer_button_click(callback: CallbackQuery, db: Database):
    user_id = callback.from_user.id

    await db.start_smoke_free(user_id)

    await callback.message.edit_text(
        "✅ Smoke-free timer started!\n\n"
        "Come back anytime to check your progress 🚀",
        reply_markup = keyboards.back_to_my_profile_keyboard
    )
    await callback.answer()

@user_router.callback_query(F.data == "how_to_use_smoke_free_timer_button_click")
async def process_how_to_use_smoke_free_timer_button_click(callback: CallbackQuery, db: Database):
    await callback.answer(
        "You can hit it whenever you feel you have truly slipped, not just smoked a single cigarette — no shame, no blame 🙂",
        show_alert = True
    )

@user_router.callback_query(F.data == "back_to_main_menu_button_click")
async def process_back_to_main_menu_button_click(callback: CallbackQuery, state: FSMContext, db: Database):
    await show_main_menu(callback, state, db=db)
    return

@user_router.callback_query(F.data == "confidence_tracker_button_click")
async def process_html_test(callback: CallbackQuery):
    pass
