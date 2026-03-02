import asyncio
import random

from aiogram import F, Router
from aiogram.types import CallbackQuery
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


# ================= START SURVEY =================

async def start_survey(callback: CallbackQuery, state: FSMContext, db: Database):
    await state.set_state(FSMSurvey.answering)

    question_id = 1
    telegram_user_id = callback.from_user.id

    await state.update_data(question_id=question_id)

    saved_answer = await db.get_answer(
        telegram_user_id=telegram_user_id,
        question_id=question_id
    )

    await callback.message.edit_text(
        build_question_text(question_id),
        reply_markup=survey_keyboard(question_id, selected_answer=saved_answer)
    )

    await callback.answer()


@survey_router.callback_query(F.data == "how_it_works_button_click")
async def process_how_it_works_button_click(callback: CallbackQuery, db: Database, state: FSMContext):
    await start_survey(callback=callback, state=state, db=db)


# ================= SAVE ANSWER =================

@survey_router.callback_query(F.data.startswith("answer:"), FSMSurvey.answering)
async def process_answer(callback: CallbackQuery, state: FSMContext, db: Database):
    _, question_id, answer_id = callback.data.split(":")
    question_id = int(question_id)
    answer_id = int(answer_id)

    telegram_user_id = callback.from_user.id

    await db.save_answer(
        telegram_user_id=telegram_user_id,
        question_id=question_id,
        answer_id=answer_id
    )

    await state.update_data(question_id=question_id)

    await callback.message.edit_reply_markup(
        reply_markup=survey_keyboard(question_id, selected_answer=answer_id)
    )

    await callback.answer("Answer saved ✅", show_alert=True)


# ================= NEXT =================

@survey_router.callback_query(F.data == "next", FSMSurvey.answering)
async def process_next(callback: CallbackQuery, state: FSMContext, db: Database):
    data = await state.get_data()
    question_id = data.get("question_id")
    telegram_user_id = callback.from_user.id
    total_questions = len(LEXICON_QUESTIONS_EN)

    if question_id == 3:

        await state.set_state(FSMSurvey.calculating)
        await show_progress_bar(callback)

        try:
            expenses = await process_calculating(db, telegram_user_id)
        except ValueError:
            await callback.message.edit_text(
                "⚠️ Some answers are missing. Please restart using /start."
            )
            await state.clear()
            return

        await db.update_daily_cost(
            telegram_user_id=telegram_user_id,
            daily_cost=expenses["daily_cost"]
        )

        await callback.message.edit_text(
            text=(
                f"📊 Wow... Face it.\n\n"
                f"You've already burned about "
                f"<tg-spoiler>${expenses['expenses_total']:,}</tg-spoiler> 💸\n\n"
                f"In 10 years you'll burn another "
                f"<tg-spoiler>${expenses['expenses_in_future']:,}</tg-spoiler>.\n\n"
                f"Are you willing to give it to tobacco companies — "
                f"<u>or keep it for yourself</u>?"
            ),
            reply_markup=keep_it_keyboard
        )
        return

    next_question_id = question_id + 1

    saved_answer = await db.get_answer(
        telegram_user_id=telegram_user_id,
        question_id=next_question_id
    )

    await state.update_data(question_id=next_question_id)

    await callback.message.edit_text(
        build_question_text(next_question_id),
        reply_markup=survey_keyboard(next_question_id, selected_answer=saved_answer)
    )
    await callback.answer()


# ================= FINISH =================

@survey_router.callback_query(F.data == "finish", FSMSurvey.answering)
async def process_finish(callback: CallbackQuery, state: FSMContext, db: Database):
    telegram_user_id = callback.from_user.id

    await db.mark_survey_completed(telegram_user_id)

    answer_4 = await db.get_answer(
        telegram_user_id=telegram_user_id,
        question_id=4
    )

    branch = "skip_intro" if answer_4 == 1 else "with_intro"

    await state.set_state(FSMSurvey.onboarding)
    await state.update_data(
        onboarding_flow="after_finish",
        onboarding_branch=branch,
        onboarding_step=0,
    )

    first_step = ONBOARDING_FLOWS_EN["after_finish"][branch][0]

    await callback.message.edit_text(
        first_step["text"],
        reply_markup=onboarding_keyboard(first_step["button"])
    )
    await callback.answer()


# ================= ONBOARDING =================

@survey_router.callback_query(F.data == "onboarding_next", FSMSurvey.onboarding)
async def process_onboarding(callback: CallbackQuery, state: FSMContext, db: Database):
    telegram_user_id = callback.from_user.id
    data = await state.get_data()

    flow_key = data.get("onboarding_flow")
    branch = data.get("onboarding_branch")
    step = data.get("onboarding_step", 0)

    flow = ONBOARDING_FLOWS_EN[flow_key][branch]
    step += 1

    if step >= len(flow):
        await db.mark_onboarding_completed(telegram_user_id)
        await show_main_menu(callback, state, db=db)
        return

    await state.update_data(onboarding_step=step)

    next_step = flow[step]
    await callback.message.edit_text(
        next_step["text"],
        reply_markup=onboarding_keyboard(next_step["button"])
    )
    await callback.answer()