from fastapi import FastAPI
from aiogram import Bot
from config.config import load_config
import uuid

app = FastAPI()

config = load_config()
bot = Bot(token=config.bot.token)


@app.post("/create-invoice")
async def create_invoice(data: dict):
    user_id = data.get("user_id")

    if not user_id:
        return {"error": "user_id required"}

    payload = f"vip_{user_id}_{uuid.uuid4()}"

    link = await bot.create_invoice_link(
        title="VIP Access",
        description="Unlock all strategies",
        payload=payload,
        currency="XTR",
        prices=[{"label": "VIP", "amount": 500}]
    )

    return {"invoice_link": link}