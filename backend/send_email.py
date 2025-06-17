import json
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")  # Optional: also store sender email in .env

def send_emails(model_id):
    """
    Sends personalized reward emails using SendGrid, based on recommendations JSON.

    Args:
        model_id (str): UUID of the model to find the correct JSON file.

    Returns:
        dict: Summary of emails sent and failed.
    """
    recommendations_path = f"recommendations_with_emails/recommendations_{model_id}.json"

    if not os.path.exists(recommendations_path):
        return {"error": f"Recommendations for model_id {model_id} not found"}

    with open(recommendations_path, "r") as f:
        recommendations = json.load(f)

    sendgrid_client = SendGridAPIClient(SENDGRID_API_KEY)
    success_list = []
    fail_list = []

    for entry in recommendations:
        email = entry.get("email")
        user_id = entry.get("user_id")
        rewards = entry.get("rewards", [])

        if not email or email == "No Email Provided":
            continue

        reward_lines = "\n".join(rewards)
        message = Mail(
            from_email=SENDER_EMAIL,
            to_emails=email,
            subject="🎁 Your Personalized Reward Recommendations!",
            plain_text_content=f"Hi {user_id},\n\nHere are your rewards:\n\n{reward_lines}\n\nCheers,\nLoyaLens"
        )

        try:
            response = sendgrid_client.send(message)
            if response.status_code in [200, 202]:
                success_list.append(email)
            else:
                fail_list.append(email)
        except Exception:
            fail_list.append(email)

    return {
        "message": "Emails processed.",
        "sent": success_list,
        "failed": fail_list
    }
