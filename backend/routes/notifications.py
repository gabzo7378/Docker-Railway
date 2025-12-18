"""
Notification routes
"""
from fastapi import APIRouter
from controllers.notificationController import (
    init_whatsapp_session,
    verify_whatsapp_login,
    send_test_message,
    close_whatsapp_session
)

router = APIRouter(tags=["notifications"])

@router.post("/notifications/whatsapp/init")
async def init_session():
    """Initialize WhatsApp session and get QR code"""
    return await init_whatsapp_session()

@router.post("/notifications/whatsapp/verify")
async def verify_session():
    """Verify WhatsApp login status"""
    return await verify_whatsapp_login()

@router.post("/notifications/whatsapp/test")
async def test_message(phone: str = "969728039"):
    """Send test message"""
    return await send_test_message(phone)

@router.post("/notifications/whatsapp/close")
async def close_session():
    """Close WhatsApp session"""
    return await close_whatsapp_session()
