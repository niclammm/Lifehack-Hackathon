# email.py
import os
import json
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# Load SENDGRID_API_KEY and SENDER from .env
load_dotenv()
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDER = os.getenv("SENDGRID_SENDER_EMAIL")

print("API KEY:", SENDGRID_API_KEY)
print("SENDER:", SENDER)

def send_bulk_from_model(model_id, base_dir="backend/recommendations_with_emails"):
    """
    Reads recommendations_<model_id>.json and sends each user a personalized email.
    Returns the number of successfully sent emails.
    """
    # 1. Locate the JSON file
    path = os.path.join(base_dir, f"recommendations_{model_id}.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model ID {model_id} not found at {path}")

    with open(path, "r") as f:
        recs = json.load(f)

    # 2. Initialize SendGrid client
    sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
    sent = 0

    # 3. Loop through each user and send email
    for entry in recs:
        email = entry.get("email")
        rewards = entry.get("rewards", [])

        if not email or email == "No Email Provided":
            continue

        body = "🎁 Here are your rewards:\n\n" + "\n".join(rewards)

        try:
            msg = Mail(
                from_email=SENDER,
                to_emails=email,
                subject="Your Personalised Rewards",
                plain_text_content=body
            )
            response = sg.send(msg)
            if response.status_code == 202:
                sent += 1
            else:
                print(f"Failed to send to {email}: Status {response.status_code}")
        except Exception as e:
            print(f"Exception while sending to {email}: {str(e)}")

    return sent
