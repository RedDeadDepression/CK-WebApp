from aiogram import Router, F
from aiogram.types import PreCheckoutQuery
from aiogram.types import Message
from database.database import Database

payment_router = Router()

@payment_router.pre_checkout_query()
async def process_pre_checkout_query(pre_checkout_query: PreCheckoutQuery, bot):
    await bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)

@payment_router.message(F.successful_payment)
async def successful_payment(message: Message, db: Database):
    user_id = message.from_user.id
    payload = message.successful_payment.invoice_payload

    print("PAYMENT SUCCESS:", message.successful_payment)
    print("PAYLOAD:", payload)

    if await db.is_vip(user_id):
        await message.answer("⚠️ You already have VIP access.")
        return

    if payload.startswith("vip_"):
        await db.set_vip(user_id)

        await message.answer("✅ Payment successful! VIP activated.")

    else:
        await message.answer("⚠️ Unknown payment type")