import asyncio
import random

from aiogram import F, Router
from aiogram.types import CallbackQuery, FSInputFile
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.context import FSMContext

from lexicon.lexicon_en import LEXICON_QUESTIONS_EN, ONBOARDING_FLOWS_EN
from database.database import Database
from keyboards.keyboards import survey_keyboard, keep_it_keyboard, onboarding_keyboard
from services.survey_utils import process_calculating, show_progress_bar
from services.common_utils import show_main_menu


survey_router = Router()


class FSMSurvey(StatesGroup):
    answering = State()
    calculating = State()
    onboarding = State()


def build_question_text(question_id: int) -> str:
    total = len(LEXICON_QUESTIONS_EN)
    return (
        f'Question {question_id} / {total}\n\n'
        f'{LEXICON_QUESTIONS_EN[question_id]}'
    )


# ================= START =================

async def start_survey(callback: CallbackQuery, state: FSMContext, db: Database):
    await state.set_state(FSMSurvey.answering)

    question_id = 1
    telegram_user_id = callback.from_user.id

    await state.update_data(question_id=question_id)

    saved_answer = await db.get_answer(telegram_user_id, question_id)

    await callback.message.edit_text(
        build_question_text(question_id),
        reply_markup=survey_keyboard(question_id, selected_answer=saved_answer)
    )
    await callback.answer()


@survey_router.callback_query(F.data == "how_it_works_button_click")
async def process_how_it_works_button_click(callback: CallbackQuery, db: Database, state: FSMContext):
    await start_survey(callback, state, db)


# ================= SAVE ANSWER =================

@survey_router.callback_query(F.data.startswith("answer:"), FSMSurvey.answering)
async def process_answer(callback: CallbackQuery, state: FSMContext, db: Database):
    _, question_id, answer_id = callback.data.split(":")
    question_id = int(question_id)
    answer_id = int(answer_id)

    telegram_user_id = callback.from_user.id

    await db.save_answer(telegram_user_id, question_id, answer_id)

    await state.update_data(question_id=question_id)

    await callback.message.edit_reply_markup(
        reply_markup=survey_keyboard(question_id, selected_answer=answer_id)
    )

    await callback.answer("Answer saved ✅", show_alert=True)


# ================= NEXT LOCKED =================

@survey_router.callback_query(F.data == "next_locked", FSMSurvey.answering)
async def process_next_locked(callback: CallbackQuery):
    await callback.answer(
        "Please, select an answer ❗",
        show_alert=True
    )


# ================= NEXT =================

@survey_router.callback_query(F.data == "next")
async def process_next(callback: CallbackQuery, state: FSMContext, db: Database):

    current_state = await state.get_state()

    if current_state != FSMSurvey.answering.state:
        await callback.answer()
        return

    data = await state.get_data()
    question_id = data.get("question_id")
    telegram_user_id = callback.from_user.id
    total_questions = len(LEXICON_QUESTIONS_EN)

    if not question_id:
        await callback.answer("Session expired. Use /start", show_alert=True)
        return

    # === SPECIAL BLOCK FOR QUESTION 3 ===
    if question_id == 3:

        # 🔥 Если onboarding уже пройден — просто идем на 4 вопрос
        if await db.is_onboarding_completed(telegram_user_id):

            next_question_id = 4

            saved_answer = await db.get_answer(
                telegram_user_id,
                next_question_id
            )

            await state.update_data(question_id=next_question_id)

            await callback.message.edit_text(
                build_question_text(next_question_id),
                reply_markup=survey_keyboard(
                    next_question_id,
                    selected_answer=saved_answer
                )
            )
            await callback.answer()
            return

        # 🚀 Если onboarding еще не пройден — запускаем его
        await state.set_state(FSMSurvey.calculating)

        await callback.message.edit_reply_markup(reply_markup=None)

        await show_progress_bar(callback)

        try:
            expenses = await process_calculating(db, telegram_user_id)
        except ValueError:
            await callback.message.edit_text(
                "⚠️ Some answers are missing. Please restart with /start."
            )
            await state.clear()
            return

        await db.update_daily_cost(
            telegram_user_id,
            expenses["daily_cost"]
        )

        await callback.message.edit_text(
            text=(
                f"📊 Wow... Face it.\n\n"
                f"You've already burned "
                f"<tg-spoiler>${expenses['expenses_total']:,}</tg-spoiler> 💸\n\n"
                f"In 10 years you'll burn "
                f"<tg-spoiler>${expenses['expenses_in_future']:,}</tg-spoiler>.\n\n"
                f"Keep it for yourself?"
            ),
            reply_markup=keep_it_keyboard
        )
        return

    # === NORMAL NEXT ===
    if question_id >= total_questions:
        await callback.answer()
        return

    next_question_id = question_id + 1

    saved_answer = await db.get_answer(
        telegram_user_id,
        next_question_id
    )

    await state.update_data(question_id=next_question_id)

    await callback.message.edit_text(
        build_question_text(next_question_id),
        reply_markup=survey_keyboard(
            next_question_id,
            selected_answer=saved_answer
        )
    )

    await callback.answer()


# ================= BACK LOCKED =================

@survey_router.callback_query(F.data == "back_locked", FSMSurvey.answering)
async def process_back_locked(callback: CallbackQuery):
    await callback.answer(
        "This is the first question 🙂",
        show_alert=True
    )


# ================= BACK =================

@survey_router.callback_query(F.data == "back")
async def process_back(callback: CallbackQuery, state: FSMContext, db: Database):

    current_state = await state.get_state()

    if current_state != FSMSurvey.answering.state:
        await callback.answer()
        return

    data = await state.get_data()
    current_question = data.get("question_id", 1)

    if current_question <= 1:
        await callback.answer("This is the first question 🙂", show_alert=True)
        return

    new_question = current_question - 1
    telegram_user_id = callback.from_user.id

    saved_answer = await db.get_answer(
        telegram_user_id,
        new_question
    )

    await state.update_data(question_id=new_question)

    await callback.message.edit_text(
        build_question_text(new_question),
        reply_markup=survey_keyboard(
            new_question,
            selected_answer=saved_answer
        )
    )

    await callback.answer()

# ================= FINISH LOCKED =================

@survey_router.callback_query(F.data == "finish_locked", FSMSurvey.answering)
async def process_finish_locked(callback: CallbackQuery):
    await callback.answer(
        "Please, select an answer ❗",
        show_alert=True
    )


# ================= FINISH =================

@survey_router.callback_query(F.data == "finish", FSMSurvey.answering)
async def process_finish(callback: CallbackQuery, state: FSMContext, db: Database):
    telegram_user_id = callback.from_user.id

    await db.mark_survey_completed(telegram_user_id)

    answer_4 = await db.get_answer(telegram_user_id, 4)
    branch = "skip_intro" if answer_4 == 1 else "with_intro"

    await state.set_state(FSMSurvey.onboarding)
    await state.update_data(
        onboarding_flow="after_finish",
        onboarding_branch=branch,
        onboarding_step=0,
        show_loader_after_step=True if branch == "with_intro" else False,
        loader_text="⏳ Analyzing your answers..."
    )

    if branch == "skip_intro":
        await show_progress_bar(
            callback,
            text="⏳ Analyzing your answers..."
        )

    first_step = ONBOARDING_FLOWS_EN["after_finish"][branch][0]

    await callback.message.edit_text(
        first_step["text"],
        reply_markup=onboarding_keyboard(first_step["button"])
    )
    await callback.answer()


# ================= ONBOARDING =================
@survey_router.callback_query(F.data == "keep_it_button_click", FSMSurvey.calculating)
async def start_onboarding(callback: CallbackQuery, state: FSMContext):
    await state.set_state(FSMSurvey.onboarding)

    await state.update_data(
        onboarding_flow="after_q3",
        onboarding_branch="default",
        onboarding_step=0,
        show_loader_after_step=False
    )

    flow = ONBOARDING_FLOWS_EN["after_q3"]["default"]
    first_step = flow[0]

    image_name = first_step.get("image")

    if image_name:
        photo = FSInputFile(f"bot/images/{image_name}")
        await callback.message.delete()
        await callback.message.answer_photo(
            photo=photo,
            caption=first_step["text"],
            reply_markup=onboarding_keyboard(first_step["button"]),
            parse_mode="HTML"
        )
    else:
        await callback.message.edit_text(
            first_step["text"],
            reply_markup=onboarding_keyboard(first_step["button"]),
            parse_mode="HTML"
        )

    await callback.answer()

@survey_router.callback_query(F.data == "onboarding_next", FSMSurvey.onboarding)
async def process_onboarding(callback: CallbackQuery, state: FSMContext, db: Database):
    telegram_user_id = callback.from_user.id
    data = await state.get_data()

    flow_key = data.get("onboarding_flow")
    branch = data.get("onboarding_branch")
    step = data.get("onboarding_step", 0)
    show_loader = data.get("show_loader_after_step", False)

    if not flow_key or not branch:
        await callback.answer("Session expired.", show_alert=True)
        await state.clear()
        return

    flow = ONBOARDING_FLOWS_EN[flow_key][branch]

    if step == 0 and show_loader:
        loader_text = data.get("loader_text")
        await show_progress_bar(callback, text=loader_text)
        await state.update_data(show_loader_after_step=False)

    step += 1

    # === FINISH FLOW ===
    if step >= len(flow):
        await db.mark_onboarding_completed(telegram_user_id)

        if flow_key == "after_q3":
            await state.set_state(FSMSurvey.answering)
            await state.update_data(question_id=4)

            saved_answer = await db.get_answer(telegram_user_id, 4)

            await callback.message.delete()

            await callback.message.answer(
                build_question_text(4),
                reply_markup=survey_keyboard(4, selected_answer=saved_answer),
                parse_mode="HTML"
            )
            await callback.answer()
            return

        if flow_key == "after_finish":
            await show_main_menu(callback, state, db=db)
            return

    # === CONTINUE FLOW ===
    await state.update_data(onboarding_step=step)
    next_step = flow[step]

    image_name = next_step.get("image")

    if image_name:
        photo = FSInputFile(f"bot/images/{image_name}")
        await callback.message.delete()
        await callback.message.answer_photo(
            photo=photo,
            caption=next_step["text"],
            reply_markup=onboarding_keyboard(next_step["button"]),
            parse_mode="HTML"
        )
    else:
        await callback.message.edit_text(
            next_step["text"],
            reply_markup=onboarding_keyboard(next_step["button"]),
            parse_mode="HTML"
        )

    await callback.answer()