LEXICON_EN = {
    "/start": "I have two goals 🏆.\n"
    "🎯 <u>First:</u> To help you quit smoking without suffering or forcing yourself.\n"
    "🎯 <u>Second:</u> To be there for you when you're really struggling.\n\n"
    "To activate me 100%, I need to get to know you a little better.\n"
    "<i>It will only take a minute.</i>"
}

LEXICON_COMMANDS_EN = {
    "/start": "Restart the bot"
}

LEXICON_QUESTIONS_EN = {
    1: "How long have you been smoking?",
    2: "How many cigarettes a day do you smoke?",
    3: "How much does a pack of cigarettes cost?",
    4: "Have you tried to quit smoking before?"
    }

LEXICON_ANSWERS_EN = {
    1: (
        "Less than a 1 year",
        "From 1 to 4 years",
        "From 5 to 10 years",
        "From 10 to 15 years",
        "From 15 to 25 years",
        "More than 25 years"
        ),
    2: (
        "Up to 5",
        "5 - 10",
        "10 - 20",
        "20 - 30",
        "more than 30"
    ),
    3: (
        "$7,95 - $8,50",
        "$9,00 - $10,25",
        "$12,50 - $14,55"
    ),
    4: (
        "Never",
        "Tried 1 - 2 times",
        "Tried 3 - 5 times",
        "Tried 5 - 8 times",
        "More than 8 attempts"
        )
}

ONBOARDING_FLOWS_EN = {
    "after_q3": {
        "default": [
            {"text": "🔥 Great attitude. But I know motivation alone isn't enough. "
            "My creator smoked for 34 years. He tried patches, books, and willpower. "
            "<b>Nothing worked</b>. Why? Because he was fighting his cravings, not his addiction.",
            "button": "What's the secret?"
            },
            {
            "text": '''The secret is <tg-spoiler>that there is <b>NO universal solution</b></tg-spoiler>. Nicotine is tricky.
            The <i>"smoke after coffee"</i> trigger and the <i>"smoke when stressed"</i> trigger require <u>different solutions</u>.
            I know them all. And <u>I'll find the right one for your situation</u>''',
            "button": "Continue"
            },
            {
            "text": "The main rule: <b>No guilt</b>. Your setbacks don't matter here. "
            "Setbacks are part of the journey. We don't start over, we keep going.",
            "button": "Sounds fair"
            }
        ]
    },

    "after_finish": {
        "skip_intro": [
            {"text": "Done! Your plan is loaded. Now you have access to <b>all the bot's features</b>.",
             "button": "How does this work?"},
            {"text": '''When you feel overwhelmed, <u>press SOS</u> – you will receive personalized techniques and your cravings will disappear.\n
             When you want to share your success with someone, <u>press My Stats</u>.''',
             "button": "And one last thing..."},
            {"text": "📌 <b>Pin this chat</b> so you don't have to search for it in a panic.\nWe're starting right now!",
             "button": "MENU"}
        ],
        "with_intro": [
            {"text": "Great. Seriously, this is good news. 📅 <b>Statistics say it takes between 7 and 13 attempts to quit for good</b>. That means you didn't fail - You just practiced. You're closer to finishing than ever.",
             "button": "Ready for the finale!"},
            {"text": "Done! Your plan is loaded. Now you have access to <b>all the bot's features</b>.",
             "button": "How does this work?"},
            {"text": '''When you feel overwhelmed, <u>press SOS</u> – you will receive personalized techniques and your cravings will disappear.\n
             When you want to share your success with someone, <u>press My Stats</u>.''',
             "button": "And one last thing..."},
            {"text": "📌 <b>Pin this chat</b> so you don't have to search for it in a panic.\nWe're starting right now!",
             "button": "MENU"}
        ]
    }
}