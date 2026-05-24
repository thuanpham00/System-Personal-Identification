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

htmlTemplate = """
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #ff4d4f; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">⚠️ Xác thực thông tin thất bại</h1>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 15px; color: #333;">Xin chào <strong>{{ho_ten}}</strong>,</p>
        <p style="color: #555; line-height: 1.7;">
          Chúng tôi đã tiến hành xác thực thông tin định danh của bạn trên hệ thống, 
          tuy nhiên thông tin bạn cung cấp <strong style="color: #ff4d4f;">không khớp</strong> 
          với dữ liệu căn cước công dân đã đăng ký.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #fff2f0; border-left: 4px solid #ff4d4f;">
            <td style="padding: 12px 16px; font-weight: bold; color: #333; width: 40%;">Họ và tên</td>
            <td style="padding: 12px 16px; color: #555;">{{ho_ten}}</td>
          </tr>
          <tr style="border-left: 4px solid #ff4d4f;">
            <td style="padding: 12px 16px; font-weight: bold; color: #333;">Số CCCD</td>
            <td style="padding: 12px 16px; color: #555;">{{cccd_number}}</td>
          </tr>
        </table>
        <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #7c5e00; font-size: 14px; line-height: 1.7;">
            📋 <strong>Vui lòng thực hiện các bước sau:</strong><br/>
            1. Truy cập lại hệ thống của chúng tôi<br/>
            2. Kiểm tra và cập nhật lại thông tin cá nhân<br/>
            3. Tải lại ảnh CCCD rõ nét, đúng mặt trước/sau<br/>
            4. Hoàn tất xác thực tài khoản
          </p>
        </div>
        <p style="color: #888; font-size: 13px;">
          Nếu bạn cần hỗ trợ, vui lòng liên hệ bộ phận chăm sóc khách hàng của chúng tôi.
        </p>
        <div style="margin-top: 32px; text-align: center;">
          <a href="#" style="background: #ff4d4f; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-size: 15px;">
            Quay lại xác thực tài khoản
          </a>
        </div>
      </div>
      <div style="background: #f9f9f9; padding: 16px; text-align: center; color: #aaa; font-size: 12px;">
        © 2026 PersonalIdentification. All rights reserved.
      </div>
    </div>
  """;

class SendVerifyEmailRequest(BaseModel):  # ← phải định nghĩa TRƯỚC khi dùng
    to_address: EmailStr

resend.api_key = os.getenv("RESEND_API_KEY")
CLIENT_URL = os.getenv("CLIENT_URL")
RESEND_EMAIL_FROM = os.getenv("RESEND_EMAIL_FROM")
    
@app.post("/send-verify-email")
async def send_verify_email(body: SendVerifyEmailRequest):
    html = htmlTemplate \
        .replace("{{ho_ten}}", "Nguyen Van A") \
        .replace("{{cccd_number}}", "123456789012") \

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