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
<div style="margin:40px auto;max-width:900px;font-family:Arial,sans-serif;font-size:14px;color:#222;line-height:1.6;padding:0 24px;">

  <h1 style="font-size:18px;font-weight:bold;margin:0 0 24px;">[Internal] Guideline - Từ chối định danh tài khoản – meCreator</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
    <tbody>
      <tr>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;font-weight:bold;width:140px;background:#f5f5f5;">Owner</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;">@Lê Thị Huyền</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;color:#888;font-size:12px;">Owner to complete</td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;font-weight:bold;width:140px;background:#f5f5f5;">Status</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;">Review</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;color:#888;font-size:12px;">Owner to complete (DRAFT REVIEW ABANDONED AGREED)</td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;font-weight:bold;width:140px;background:#f5f5f5;">Contributors</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;"></td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;color:#888;font-size:12px;">Contributor to complete</td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;font-weight:bold;width:140px;background:#f5f5f5;">Tracker</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;">Internal Ops Guideline - Creator Verification</td>
        <td style="border:1px solid #ccc;padding:8px 12px;vertical-align:top;color:#888;font-size:12px;">Owner to complete</td>
      </tr>
    </tbody>
  </table>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>

  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Background</h2>
  <p style="margin:6px 0;">meCreator yêu cầu creator hoàn tất định danh để đảm bảo tính pháp lý và thanh toán.</p>
  <p style="margin:6px 0;">Trong quá trình xét duyệt, một số hồ sơ không đáp ứng yêu cầu cần được từ chối và hướng dẫn bổ sung.</p>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>

  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Problem Statement</h2>
  <p style="margin:6px 0;">Creator thường:</p>
  <ul style="margin:4px 0 8px 20px;padding:0;">
    <li style="margin:2px 0;">Upload sai CCCD</li>
    <li style="margin:2px 0;">Thiếu thông tin</li>
    <li style="margin:2px 0;">Không hiểu lý do bị từ chối</li>
  </ul>
  <p style="margin:6px 0;">Ops xử lý thủ công =&gt; mất nhiều thời gian, thiếu nhất quán.</p>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>

  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Goals &amp; Non-goals</h2>
  <h3 style="font-size:14px;font-weight:bold;margin:20px 0 6px;">Goals</h3>
  <ul style="margin:4px 0 8px 20px;padding:0;">
    <li style="margin:2px 0;">Chuẩn hóa cách xác định lý do từ chối định danh</li>
    <li style="margin:2px 0;">Chuẩn hóa nội dung email phản hồi tự động gửi cho người dùng</li>
    <li style="margin:2px 0;">Nguyên tắc chung khi từ chối định danh: Mỗi hồ sơ chỉ gán 1 lý do từ chối chính =&gt; Mỗi lý do map với 1 template email cố định</li>
  </ul>
  <h3 style="font-size:14px;font-weight:bold;margin:20px 0 6px;">Non-goals</h3>
  <ul style="margin:4px 0 8px 20px;padding:0;">
    <li style="margin:2px 0;">Không áp dụng cho tài khoản doanh nghiệp</li>
  </ul>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>

  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Scope</h2>
  <ul style="margin:4px 0 8px 20px;padding:0;">
    <li style="margin:2px 0;">Creator cá nhân</li>
    <li style="margin:2px 0;">Định danh CCCD điện tử qua VNeID</li>
  </ul>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>

  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Case List &amp; Handling</h2>

  <h3 style="font-size:14px;font-weight:bold;margin:20px 0 6px;">Lỗi liên quan đến CCCD / Định danh cá nhân</h3>
  <table style="width:100%;border-collapse:collapse;margin:12px 0 24px;">
    <thead>
      <tr>
        <th style="background:#f0f0f0;border:1px solid #ccc;padding:10px 14px;font-weight:bold;text-align:left;">Case</th>
        <th style="background:#f0f0f0;border:1px solid #ccc;padding:10px 14px;font-weight:bold;text-align:left;">Mẫu trả lời</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">Thiếu căn cước công dân (Không tải lên bất kỳ hình ảnh CCCD nào)</td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Thiếu căn cước công dân (không có hình ảnh CCCD được tải lên trong hồ sơ).<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vui lòng mở ứng dụng VNeID.<br/>
          Chọn mục "Ví giấy tờ" =&gt; "Thẻ Căn cước/CCCD" =&gt; "Căn cước điện tử"<br/>
          Chụp full màn hình hiển thị:<br/>
          1. Mặt trước (ảnh chân dung và thông tin cơ bản)<br/>
          2. Mặt sau (thông tin bổ sung)<br/>
          <em>Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa</em>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">
          <span style="font-weight:bold;color:#333;display:block;margin-bottom:4px;">Sai loại hình ảnh CCCD (KHÔNG chụp từ VNeID)</span>
          <span style="color:#555;font-size:13px;">Ảnh chụp CCCD vật lý<br/>Ảnh scan/photo lại từ giấy<br/>Ảnh chụp màn hình không phải từ app VNeID</span>
        </td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Ảnh CCCD điện tử bạn tải lên không đúng yêu cầu (không chụp từ ứng dụng VNeID)<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vui lòng mở ứng dụng VNeID.<br/>
          Chọn mục "Ví giấy tờ" =&gt; "Thẻ Căn cước/CCCD" =&gt; "Căn cước điện tử"<br/>
          Chụp full màn hình hiển thị:<br/>
          &nbsp;&nbsp;1. Mặt trước (ảnh chân dung + thông tin cơ bản)<br/>
          &nbsp;&nbsp;2. Mặt sau (thông tin bổ sung)<br/>
          <em>Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa</em>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">Thiếu hình ảnh mặt trước hoặc mặt sau CCCD điện tử</td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Hồ sơ định danh của bạn chưa đầy đủ do thiếu hình ảnh mặt trước hoặc mặt sau của CCCD điện tử<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vui lòng chụp và tải lên đầy đủ cả hai mặt CCCD điện tử từ ứng dụng VNeID (mặt trước và mặt sau)
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">
          <span style="font-weight:bold;color:#333;display:block;margin-bottom:4px;">Hình ảnh CCCD điện tử không rõ / không hợp lệ</span>
          <span style="color:#555;font-size:13px;">Ảnh mờ, rung, vỡ nét<br/>Bị che góc<br/>Bị cắt xén<br/>Có dấu hiệu chỉnh sửa</span>
        </td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Ảnh CCCD điện tử bạn tải lên không đúng yêu cầu (không hiển thị đầy đủ thông tin bổ sung chi tiết)<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          - Vui lòng mở ứng dụng VNeID.<br/>
          - Chọn mục "Ví giấy tờ" =&gt; "Thẻ Căn cước/CCCD" =&gt; "Căn cước điện tử"<br/>
          - Chụp full màn hình hiển thị: Mặt trước (ảnh chân dung + thông tin cơ bản)<br/>
          - <em>Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa, chụp đầy đủ tới hết ngày cấp CCCD</em>
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">
          <span style="font-weight:bold;color:#333;display:block;margin-bottom:4px;">Thông tin CCCD không khớp với thông tin tài khoản</span>
          <span style="color:#555;font-size:13px;">Họ tên trên CCCD không trùng tên tài khoản<br/>Số CCCD khác mã số thuế<br/>Ngày cấp / nơi cấp không hợp lệ</span>
        </td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Thông tin trên CCCD điện tử không khớp với thông tin tài khoản đã đăng ký trên hệ thống<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vui lòng kiểm tra và đảm bảo họ tên, số CCCD và các thông tin cá nhân trên tài khoản trùng khớp hoàn toàn với CCCD điện tử<br/><br/>
          Vui lòng cập nhật mã số thuế cá nhân trong app VNeID<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vào VNeID --&gt; Chọn Ví giấy tờ<br/>
          Chọn mục Thông tin thuế<br/>
          Chọn Đồng bộ thông tin / Cập nhật<br/>
          Tải ứng dụng Etax về chọn đăng nhập bằng VNeID để kiểm tra MST cá nhân đã được cập nhật thành số CCCD
        </td>
      </tr>
    </tbody>
  </table>

  <h3 style="font-size:14px;font-weight:bold;margin:20px 0 6px;">Lỗi liên quan đến tài khoản ngân hàng</h3>
  <table style="width:100%;border-collapse:collapse;margin:12px 0 24px;">
    <thead>
      <tr>
        <th style="background:#f0f0f0;border:1px solid #ccc;padding:10px 14px;font-weight:bold;text-align:left;">Case</th>
        <th style="background:#f0f0f0;border:1px solid #ccc;padding:10px 14px;font-weight:bold;text-align:left;">Mẫu trả lời</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">
          <span style="font-weight:bold;color:#333;display:block;margin-bottom:4px;">Tài khoản ngân hàng không hợp lệ</span>
          <span style="color:#555;font-size:13px;">Sai số tài khoản<br/>Không tồn tại<br/>Không xác minh được</span>
        </td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Thông tin tài khoản ngân hàng được cung cấp không hợp lệ hoặc không xác minh được<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vui lòng kiểm tra lại số tài khoản, tên ngân hàng và chi nhánh, sau đó cập nhật thông tin chính xác
        </td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;width:35%;background:#fafafa;">Tên chủ tài khoản ngân hàng không trùng CCCD</td>
        <td style="border:1px solid #ccc;padding:10px 14px;vertical-align:top;">
          <strong>Lý do từ chối định danh:</strong><br/>
          Tên chủ tài khoản ngân hàng không trùng khớp với thông tin trên CCCD điện tử<br/><br/>
          <strong>Hướng dẫn bổ sung:</strong><br/>
          Vui lòng sử dụng tài khoản ngân hàng chính chủ, có tên trùng khớp với CCCD điện tử để hoàn tất định danh
        </td>
      </tr>
    </tbody>
  </table>

  <h3 style="font-size:14px;font-weight:bold;margin:20px 0 6px;">Lỗi khác</h3>
  <ul style="margin:4px 0 8px 20px;padding:0;">
    <li style="margin:2px 0;">Thiếu thông tin bắt buộc khác</li>
    <li style="margin:2px 0;">Thiếu email nhận hợp đồng</li>
    <li style="margin:2px 0;">Thiếu địa chỉ chi tiết</li>
    <li style="margin:2px 0;">Để được duyệt tham gia chiến dịch Vaseline Creator, bạn vui lòng tham gia chiến dịch nền tảng và liên kết với tài khoản TikTok đăng bài (Điều kiện tài khoản TikTok có tối thiểu 1000 follower)</li>
  </ul>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>

  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">MẪU EMAIL CHUNG</h2>
  <div style="border:1px solid #ddd;border-radius:4px;padding:24px 28px;margin:16px 0 28px;background:#fafafa;">
    <p style="font-weight:bold;margin:0 0 16px;">Tiêu đề: Thông báo: Yêu cầu định danh tài khoản của bạn chưa được chấp nhận</p>
    <p style="margin:8px 0;">Chào <strong>{{name}}</strong>,</p>
    <p style="margin:8px 0;">Cảm ơn bạn đã gửi yêu cầu định danh tài khoản trên meCreator. Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng yêu cầu định danh của bạn chưa được chấp nhận do không đáp ứng một số tiêu chí theo quy định.</p>
    <p style="margin:8px 0;"><strong>Lý do từ chối định danh:</strong></p>
    <p style="margin:8px 0;color:#888;font-style:italic;">{{reason}}</p>
    <p style="margin:8px 0;"><strong>Hướng dẫn bổ sung:</strong></p>
    <p style="margin:8px 0;color:#888;font-style:italic;">{{instruction}}</p>
    <p style="margin:8px 0;">Bạn vui lòng cập nhật lại thông tin và gửi lại yêu cầu định danh để chúng tôi tiếp tục xét duyệt.</p>
    <p style="margin:8px 0;">Rất mong sớm nhận được thông tin chính xác từ bạn để hoàn tất đăng ký.</p>
    <p style="margin:8px 0;"><strong>Hướng dẫn tiếp theo:</strong></p>
    <p style="margin:8px 0;">Bạn có thể cập nhật và gửi lại yêu cầu định danh bằng cách:</p>
    <ul style="margin:4px 0 8px 20px;padding:0;">
      <li style="margin:2px 0;">Đăng nhập vào tài khoản của bạn trên meCreator</li>
      <li style="margin:2px 0;">Truy cập mục "Hồ sơ của tôi" =&gt; "Thông tin thanh toán"</li>
      <li style="margin:2px 0;">Chỉnh sửa hoặc bổ sung tài liệu theo yêu cầu</li>
    </ul>
    <p style="margin:8px 0;">Chúng tôi khuyến khích bạn kiểm tra kỹ các thông tin trước khi gửi lại để đảm bảo quá trình định danh được hoàn thành nhanh chóng.</p>
    <p style="margin:8px 0;">Nếu bạn cần hỗ trợ thêm hoặc có bất kỳ câu hỏi nào khác, vui lòng liên hệ: <a href="mailto:op.brand@themetub.com" style="color:#1155cc;text-decoration:none;">op.brand@themetub.com</a></p>
    <p style="margin:8px 0;">Trân trọng,<br/><strong>meCreator Team</strong></p>
  </div>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>
  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Checklist cho Ops</h2>

  <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;"/>
  <h2 style="font-size:15px;font-weight:bold;margin:28px 0 8px;">Open Discussion / Future Improvement</h2>

</div>
"""


class SendVerifyEmailRequest(BaseModel):  # ← phải định nghĩa TRƯỚC khi dùng
    to_address: EmailStr
    name: Optional[str] = None
    reason: Optional[str] = None
    instruction: Optional[str] = None

resend.api_key = os.getenv("RESEND_API_KEY")
CLIENT_URL = os.getenv("CLIENT_URL")
RESEND_EMAIL_FROM = os.getenv("RESEND_EMAIL_FROM")
    
@app.post("/send-verify-email")
async def send_verify_email(body: SendVerifyEmailRequest):
    html = htmlTemplate \
        .replace("{{name}}", body.name or "Nguyen Van A") \
        .replace("{{reason}}", body.reason or "Lý do từ chối định danh") \
        .replace("{{instruction}}", body.instruction or "Hướng dẫn bổ sung")

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