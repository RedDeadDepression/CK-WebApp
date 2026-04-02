from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    CallbackQuery,
    WebAppInfo
    )

from aiogram.utils.keyboard import InlineKeyboardBuilder

from lexicon.lexicon_en import (
    LEXICON_ANSWERS_EN,
    LEXICON_QUESTIONS_EN
)


# MAIN MENU Keyboard
def get_main_menu_keyboard(is_survey_completed: bool):
    main_menu_keyboard_builder = InlineKeyboardBuilder()

    main_menu_keyboard_builder.row(
        InlineKeyboardButton(
            text = "🚭 SOS / I want to smoke",
            web_app = WebAppInfo(
                url = "https://ck-webapp-production.up.railway.app" # ЗАМЕНИТЬ
            )
        )
    )

    if is_survey_completed:
        main_menu_keyboard_builder.row(
            InlineKeyboardButton(
                text = "📈 MY STATS",
                callback_data = "my_stats_button_click"
            )
        )

    else:
        main_menu_keyboard_builder.row(
            InlineKeyboardButton(
                text = "🔒 MY STATS",
                callback_data = "my_stats_locked"
            )
        )

        main_menu_keyboard_builder.row(
            InlineKeyboardButton(
                text = "⚠️ How It Works",
                callback_data="how_it_works_button_click"
            )
        )

    return main_menu_keyboard_builder.as_markup()

 # Get Started keyboard
get_started_keyboard_builder = InlineKeyboardBuilder()
get_started_keyboard_buttons = [
    InlineKeyboardButton(
        text = "GET STARTED ❗",
        callback_data = "get_started_button_click"
    )
]

get_started_keyboard_builder.row(*get_started_keyboard_buttons, width = 1)

get_started_keyboard = get_started_keyboard_builder.as_markup()

 # Survey keyboard
def survey_keyboard(question_id: int, selected_answer: int | None = None):
    survey_keyboard_builder = InlineKeyboardBuilder()

    answers = LEXICON_ANSWERS_EN.get(question_id)
    if not answers:
        return None

    survey_keyboard_buttons = [
        InlineKeyboardButton(
            text = f'✅ {answer_text}' if selected_answer == idx else answer_text,
            callback_data = f'answer:{question_id}:{idx}'
            )
            for idx, answer_text in enumerate(answers, start = 1)
        ]

    survey_keyboard_builder.add(*survey_keyboard_buttons)
    survey_keyboard_builder.adjust(1)

    is_last_question = question_id == len(LEXICON_QUESTIONS_EN)

    navigation_buttons = [
        InlineKeyboardButton(
            text = "⬅️ Back" if not question_id == 1 else "⛔ Back",
            callback_data = "back" if not question_id == 1 else "back_locked"
            ),
        InlineKeyboardButton(
            text = "Finish 🏁" if is_last_question else "Next ➡️"
            if selected_answer is not None else ("Finish ⛔" if is_last_question else "Next ⛔"),
            callback_data = ("finish" if is_last_question and selected_answer is not None else
            "finish_locked" if is_last_question else
            "next" if selected_answer is not None else
            "next_locked"
            )
        )
    ]

    survey_keyboard_builder.row(*navigation_buttons)

    return survey_keyboard_builder.as_markup()

 # Keep_it keyboard
keep_it_keyboard_builder = InlineKeyboardBuilder()
keep_it_keyboard_buttons = [
    InlineKeyboardButton(
        text = "Keep it for yourself ❗",
        callback_data = "keep_it_button_click"
    )
]

keep_it_keyboard_builder.row(*keep_it_keyboard_buttons, width = 1)

keep_it_keyboard = keep_it_keyboard_builder.as_markup()

 # Onboarding keyboard
def onboarding_keyboard(text: str):
    onboarding_keyboard_builder = InlineKeyboardBuilder()
    onboarding_keyboard_buttons = [
        InlineKeyboardButton(
            text = text,
            callback_data = "onboarding_next")
    ]

    onboarding_keyboard_builder.row(*onboarding_keyboard_buttons, width = 1)

    return onboarding_keyboard_builder.as_markup()

 # Back to Main menu
back_to_main_menu_keyboard_builder = InlineKeyboardBuilder()

back_to_main_menu_keyboard_buttons = [
    InlineKeyboardButton(
        text = "⬅️ Back to 🏠 MAIN MENU",
        callback_data = "back_to_main_menu_button_click"
    )
]

back_to_main_menu_keyboard_builder.row(*back_to_main_menu_keyboard_buttons, width = 1)

back_to_main_menu_keyboard = back_to_main_menu_keyboard_builder.as_markup()
