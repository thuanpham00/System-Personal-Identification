from google.cloud import vision
from app.log_config import get_logger
import json
import os
from google.oauth2 import service_account
logger = get_logger(__name__)


class GoogleVisionService:
    def __init__(self):
        creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        credentials = service_account.Credentials.from_service_account_info(
            json.loads(creds_json)
        )
        self.client = vision.ImageAnnotatorClient(credentials=credentials)

    def extract_text_lines(self, image_path: str):
        """
        OCR ảnh bằng Google Vision API
        Trả về list lines
        """

        with open(image_path, "rb") as image_file:
            content = image_file.read()

        image = vision.Image(content=content)

        response = self.client.document_text_detection(image=image)

        if response.error.message:
            raise Exception(response.error.message)

        full_text = response.full_text_annotation.text

        if not full_text:
            return []

        lines = [
            line.strip()
            for line in full_text.split("\n")
            if line.strip()
        ]

        logger.info(f"Google Vision OCR lines: {lines}")

        return lines