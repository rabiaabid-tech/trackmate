import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# 1. AI Match Alert (Sent to Owner when a match is found)
# async def send_match_alert_email(email_to: EmailStr, lost_item_name: str, found_item_id: int) -> None:
#     html_body = f"""
#     <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
#         <h2 style="color: #D4AF37;">Match Detected!</h2>
#         <p>Our AI system has detected a potential match for your reported lost item: <strong>"{lost_item_name}"</strong>.</p>
#         <p>Please log in to TrackMate to review this item and file an official claim.</p>
#         <div style="margin-top: 20px;">
#             <a href="http://localhost:5173/found/{found_item_id}" style="background-color: #0B1F4D; color: #D4AF37; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Found Item</a>
#         </div>
#     </div>
#     """
#     message = MessageSchema(subject=f"TrackMate Alert: Match for {lost_item_name}", recipients=[email_to], body=html_body, subtype=MessageType.html)
#     await FastMail(conf).send_message(message)

# 2. OTP Email (Sent to Claimant after approval)
async def send_verification_email(email_to: EmailStr, code: str, item_name: str, finder_name: str, finder_contact: str = None) -> None:
    
    contact_section = f"<p><strong>Finder's Contact Info to coordinate meeting:</strong><br/>Phone: {finder_contact}</p>" if finder_contact else ""
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2E86C1;">Item Verification Code</h2>
        <p>Your claim for <strong>"{item_name}"</strong> has been approved by {finder_name}.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2E86C1; letter-spacing: 5px;">{code}</h1>
        </div>
        {contact_section}
        <p style="color: #d9534f; font-size: 12px;"><em>Do NOT share the 6-digit code until you physically inspect the item.</em></p>
    </div>
    """
    message = MessageSchema(subject="Your Handover OTP", recipients=[email_to], body=html_body, subtype=MessageType.html)
    await FastMail(conf).send_message(message)

# 3. New Claim Alert (Sent to Finder)
# async def send_new_claim_alert(email_to: EmailStr, item_name: str, claimant_name: str) -> None:
#     html_body = f"<h2>New Claim Received!</h2><p>{claimant_name} has claimed your found item: <strong>{item_name}</strong>. Review it on your dashboard.</p>"
#     message = MessageSchema(subject="TrackMate: New Claim Alert", recipients=[email_to], body=html_body, subtype=MessageType.html)
#     await FastMail(conf).send_message(message)

# 4. Finder Handover Info (Sent to Finder after approval)
async def send_finder_contact_info(email_to: EmailStr, item_name: str, claimant_email: str, claimant_contact: str = None) -> None:
    
    phone_li = f"<li><strong>Phone:</strong> {claimant_contact}</li>" if claimant_contact else ""
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #D4AF37;">Handover Coordination</h2>
        <p>You have approved the claim for <strong>"{item_name}"</strong>.</p>
        <p>Please contact the owner to coordinate the return:</p>
        <ul>
            <li><strong>Email:</strong> {claimant_email}</li>
            {phone_li}
        </ul>
        <p>When you meet, ask them for the 6-digit OTP they received via email and enter it in your TrackMate dashboard to complete the handover and boost your Trust Score.</p>
    </div>
    """
    message = MessageSchema(subject="Action Required: Handover Info", recipients=[email_to], body=html_body, subtype=MessageType.html)
    await FastMail(conf).send_message(message)