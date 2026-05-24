"""
CCCD Verification API Server v6 - Google Vision OCR
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import uvicorn
import httpx
import tempfile
import os

from pydantic import BaseModel, EmailStr
from typing import List ,Optional, Dict
from app.ocr_service import OCRService
from app.log_config import get_logger
import resend
from dotenv import load_dotenv
load_dotenv()

logger = get_logger(__name__)


app = FastAPI(
    title="CCCD Verification API v6",
    description="Google Vision OCR API",
    version="6.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ocr_service = OCRService()

class VerifyRequest(BaseModel):
    image_url: str


class VerifyTwoRequest(BaseModel):
    form_image_url: str
    cccd_image_url: str
    imageOther: Optional[List[str]] = []
    
def _normalize_name(name: str) -> str:
    import unicodedata
    name = name.strip().lower()
    nfkd = unicodedata.normalize("NFD", name)
    out = "".join(c for c in nfkd if not unicodedata.combining(c))
    out = out.replace("đ", "d")
    return " ".join(out.split())

@app.get("/")
async def root():
    return {
        "message": "CCCD Verify API v6 đang chạy",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok"
    }

VERIFY_EMAIL_TEMPLATE = """
<html>
  <body>
    <h1>{{title}}</h1>
    <p>{{content}}</p>
    <a href="{{link}}">{{titleLink}}</a>
  </body>
</html>
"""

class SendVerifyEmailRequest(BaseModel):  # ← phải định nghĩa TRƯỚC khi dùng
    to_address: EmailStr

resend.api_key = os.getenv("RESEND_API_KEY")
CLIENT_URL = os.getenv("CLIENT_URL")
RESEND_EMAIL_FROM = os.getenv("RESEND_EMAIL_FROM")
    
@app.post("/send-verify-email")
async def send_verify_email(body: SendVerifyEmailRequest):
    html = VERIFY_EMAIL_TEMPLATE \
        .replace("{{title}}", "Vui lòng xác minh email của bạn") \
        .replace("{{content}}", "Nhấp vào nút bên dưới để xác minh email của bạn") \

    try:
        result = resend.Emails.send({
            "from": RESEND_EMAIL_FROM,
            "to": body.to_address,
            "subject": "Verify your email",
            "html": html
        })
        return {"status": "ok", "id": result["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify-two")
async def verify_two_images(body: VerifyTwoRequest):
    """
    OCR riêng form và CCCD + OCR ảnh phụ (không verify)
    """

    form_path = None
    cccd_path = None
    other_paths = []

    try:
       
        form_path = await _download_image(body.form_image_url)
        form_result = ocr_service.extract_form_only(form_path)

        cccd_path = await _download_image(body.cccd_image_url)
        cccd_result = ocr_service.extract_cccd_only(cccd_path)

        other_results = []

        for url in (body.imageOther or []):
            try:
                path = await _download_image(url)
                other_paths.append(path)

                lines = ocr_service.google_vision.extract_text_lines(path)
                
                parsed = ocr_service.parse_other_fields(lines)
                
                logger.info(f"LINES: {lines}")
                parsed = ocr_service.parse_other_fields(lines)
                logger.info(f"PARSED: {parsed}")

                other_results.append({
                    "raw_text": lines,
                    "parsed_fields": parsed
                })

            except Exception as e:
                logger.warning(f"OCR other image failed: {url} - {e}")
                
        merged_fields = {
            "ten_tai_khoan": "",
            "email_nhan_hop_dong": ""
        }

        for item in other_results:
            parsed = item.get("parsed_fields", {})
            for key in merged_fields:
                if not merged_fields[key] and parsed.get(key):
                    merged_fields[key] = parsed[key]

        form_data = form_result["form_data"]
        cccd_data = cccd_result["cccd_data"]
        
        # ============================================
        # VALIDATE: cccd_data không được rỗng
        # ============================================
        verify_status = "OK"
        verify_errors = []

        # Kiểm tra OCR CCCD có lấy được data không
        if not cccd_data.get("ho_ten") and not cccd_data.get("so_cccd"):
            verify_status = "FAILED"
            verify_errors.append("Không đọc được thông tin CCCD, vui lòng chụp lại ảnh rõ hơn")

        else:
            # So sánh ho_ten
            if form_data.get("ho_ten") and cccd_data.get("ho_ten"):
                if _normalize_name(form_data["ho_ten"]) != _normalize_name(cccd_data["ho_ten"]):
                    verify_status = "FAILED"
                    verify_errors.append(
                        f"Họ tên không khớp: form='{form_data['ho_ten']}' | cccd='{cccd_data['ho_ten']}'"
                    )

            # So sánh so_cccd
            if form_data.get("so_cccd") and cccd_data.get("so_cccd"):
                if form_data["so_cccd"] != cccd_data["so_cccd"]:
                    verify_status = "FAILED"
                    verify_errors.append(
                        f"Số CCCD không khớp: form='{form_data['so_cccd']}' | cccd='{cccd_data['so_cccd']}'"
                    )

            # So sánh ngay_cap
            if form_data.get("ngay_cap") and cccd_data.get("ngay_cap"):
                if form_data["ngay_cap"] != cccd_data["ngay_cap"]:
                    verify_status = "FAILED"
                    verify_errors.append(
                        f"Ngày cấp không khớp: form='{form_data['ngay_cap']}' | cccd='{cccd_data['ngay_cap']}'"
                    )

        response_data = {
            "status": verify_status,
            "message": "OCR thành công" if verify_status == "OK" else " | ".join(verify_errors),
            "verify_errors": verify_errors,  # ✅ thêm field này
            "form_data": form_result["form_data"],
            "cccd_data": cccd_result["cccd_data"],
            "raw_form_text": form_result["raw_form_text"],
            "raw_cccd_text": cccd_result["raw_cccd_text"],
            "other_images": other_results,
            "merged_other_fields": merged_fields  # 👈 thêm field này
        }

        return JSONResponse(content=response_data)

    except Exception as e:
        logger.error(f"Lỗi verify-two: {e}", exc_info=True)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        # cleanup
        if form_path and os.path.exists(form_path):
            os.remove(form_path)

        if cccd_path and os.path.exists(cccd_path):
            os.remove(cccd_path)

        for p in other_paths:
            if os.path.exists(p):
                os.remove(p)


@app.post("/ocr-only")
async def ocr_only(body: VerifyRequest):
    temp_path = None

    try:
        temp_path = await _download_image(body.image_url)

        result = ocr_service.extract_both_regions(temp_path)

        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"Lỗi OCR only: {e}", exc_info=True)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


async def _download_image(url: str) -> str:

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()

    content_type = response.headers.get("content-type", "")

    ext = ".png" if "png" in content_type else ".jpg"

    fd, path = tempfile.mkstemp(suffix=ext)

    with os.fdopen(fd, "wb") as f:
        f.write(response.content)

    return path


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )