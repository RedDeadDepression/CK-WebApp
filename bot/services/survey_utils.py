import re
import asyncio
import random

from aiogram.types import CallbackQuery, Message
from lexicon.lexicon_en import LEXICON_ANSWERS_EN
from typing import Dict


def get_answer_text(question_id: int, answer_id: int, lexicon: dict = LEXICON_ANSWERS_EN) -> str:
    return lexicon[question_id][answer_id - 1]

def parse_average_number(text: str) -> float:
    text = text.replace(",", ".")
    numbers = re.findall(r"\d+(?:\.\d+)?", text)
    values =  [float(n) for n in numbers]
    return sum(values) / len(values)

def calculate_expenses(answers: dict[str, int]) -> dict[str, float]:
    experience_text = get_answer_text(1, answers["answer_id01"])
    cigs_per_day_text = get_answer_text(2, answers["answer_id02"])
    pack_price_text = get_answer_text(3, answers["answer_id03"])

    experience = parse_average_number(experience_text)
    cigs_per_day = parse_average_number(cigs_per_day_text)
    pack_price = parse_average_number(pack_price_text)

    cigs_in_pack = 20
    days_in_year = 365
    daily_cost = (pack_price * cigs_per_day) / cigs_in_pack

    expenses_total = daily_cost * experience * days_in_year
    expenses_in_future = daily_cost * 10 * days_in_year

    return {
        "daily_cost": round(daily_cost, 2),
        "expenses_total": round(expenses_total, 2),
        "expenses_in_future": round(expenses_in_future, 2)
    }

async def process_calculating(db, user_id: int) -> Dict[str,float]:

    answers = {
        "answer_id01": await db.get_answer(user_id, 1),
        "answer_id02": await db.get_answer(user_id, 2),
        "answer_id03": await db.get_answer(user_id, 3)
    }

    if any(v is None for v in answers.values()):
        raise ValueError("⚠️ Some answers are missing. Please restart the survey using /start.")

    expenses = calculate_expenses(answers)

    return expenses

async def show_progress_bar(
        callback: CallbackQuery,
        *,
        progress_bar_steps: int = 15,
        min_delay: float = 0.1,
        max_delay: float = 0.5,
        text: str = "⏳ Calculating your expenses... Please, wait a moment"
) -> Message:

    progress_bar_animation = "░" * progress_bar_steps
    animation_one, animation_two = "█", "░"

    msg = await callback.message.edit_text(
        f"{text}\n<code>[{progress_bar_animation}]   0%</code>",
        parse_mode="HTML"
    )

    current_percent = 0

    for step in range(1, progress_bar_steps + 1):
        await asyncio.sleep(random.uniform(min_delay, max_delay))

        ideal_percent = int((step / progress_bar_steps) * 100)
        delta = random.randint(-5, 5)
        percent = max(current_percent, min(ideal_percent + delta, 100))

        if percent == current_percent:
            continue

        current_percent = percent

        filled_segments = int(progress_bar_steps * (percent / 100))
        progress_visual = (
            animation_one * filled_segments +
            animation_two * (progress_bar_steps - filled_segments)
        )

        await msg.edit_text(
            f"{text}\n<code>[{progress_visual}] {percent:3d}%</code>",
            parse_mode="HTML"
        )

    if current_percent < 100:
        await msg.edit_text(
            f"{text}\n<code>[{animation_one * progress_bar_steps}] 100%</code>",
            parse_mode="HTML"
        )

    return msg