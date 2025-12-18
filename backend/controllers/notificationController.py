"""
WhatsApp notification controller
"""
from fastapi import HTTPException
from services.notifications_whatsapp.driver import setup_driver
from services.notifications_whatsapp.session import wait_for_login, verify_login
from services.notifications_whatsapp.sender import send_message

# Global driver instance
_driver = None

async def init_whatsapp_session():
    """Initialize WhatsApp session and return QR code"""
    global _driver
    
    try:
        if _driver:
            _driver.quit()
        
        _driver = setup_driver()
        qr_base64 = wait_for_login(_driver)
        
        if qr_base64 is True:
            return {"status": "already_logged_in", "qr": None}
        
        return {"status": "qr_ready", "qr": qr_base64}
        
    except Exception as e:
        if _driver:
            _driver.quit()
            _driver = None
        raise HTTPException(status_code=500, detail=str(e))

async def verify_whatsapp_login():
    """Verify WhatsApp login status"""
    global _driver
    
    if not _driver:
        raise HTTPException(status_code=400, detail="No active session")
    
    try:
        is_logged = verify_login(_driver)
        return {"logged_in": is_logged}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def send_test_message(phone: str):
    """Send test message"""
    global _driver
    
    if not _driver:
        raise HTTPException(status_code=400, detail="No active session")
    
    try:
        result = send_message(_driver, phone, "Mensaje de prueba desde Academia")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def close_whatsapp_session():
    """Close WhatsApp session"""
    global _driver
    
    if _driver:
        _driver.quit()
        _driver = None
    
    return {"status": "closed"}
