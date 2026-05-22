import re
import unicodedata
from typing import Dict, List, Any
from datetime import datetime
from app.log_config import get_logger
from app.google_vision_service import GoogleVisionService

logger = get_logger(__name__)

def _normalize_date(date_str: str) -> str:
        for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
            except:
                pass
        return date_str


def _remove_accents(text: str) -> str:
    text = text.lower().strip()

    nfkd = unicodedata.normalize("NFD", text)

    out = "".join(
        c for c in nfkd
        if not unicodedata.combining(c)
    )

    out = out.replace("đ", "d")

    return re.sub(r"[^a-z0-9 ]", " ", out).strip()


class OCRService:
    def __init__(self):
        self.google_vision = GoogleVisionService()

    # =========================================================
    # ENTRY
    # =========================================================

    def extract_form_only(self, image_path: str) -> Dict[str, Any]:
        lines = self.google_vision.extract_text_lines(image_path)

        form_data = self._parse_form(lines)

        return {
            "raw_form_text": lines,
            "raw_cccd_text": [],
            "form_data": form_data,
            "cccd_data": {
                "ho_ten": "",
                "so_cccd": "",
                "ngay_cap": "",
                "noi_cap": "",
            }
        }

    def extract_cccd_only(self, image_path: str) -> Dict[str, Any]:
        lines = self.google_vision.extract_text_lines(image_path)

        cccd_data = self._parse_cccd(lines)

        return {
            "raw_form_text": [],
            "raw_cccd_text": lines,
            "form_data": {
                "ho_ten": "",
                "so_cccd": "",
                "ngay_cap": "",
                "noi_cap": "",
            },
            "cccd_data": cccd_data,
        }
        
    def parse_other_fields(self, lines: List[str]) -> Dict[str, str]:
        result = {
            "ten_tai_khoan": "",
            "email_nhan_hop_dong": ""
        }

        for i, line in enumerate(lines):
            norm = line.strip().lower()

            # TÊN TÀI KHOẢN
            if "tên tài khoản" in norm or "ten tai khoan" in norm:
                if i + 1 < len(lines):
                    result["ten_tai_khoan"] = lines[i + 1].strip()

            # EMAIL NHẬN HỢP ĐỒNG
            if "email nhận hợp đồng" in norm or "email nhan hop dong" in norm:
                if i + 1 < len(lines):
                    m = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", lines[i + 1])
                    if m:
                        result["email_nhan_hop_dong"] = m.group()
                    else:
                        result["email_nhan_hop_dong"] = lines[i + 1].strip()

        return result

    # =========================================================
    # FORM PARSER
    # =========================================================

    def _parse_form(self, lines: List[str]) -> Dict[str, str]:
        result = {
            "ho_ten": "",
            "so_cccd": "",
            "ngay_cap": "",
            "noi_cap": "",
        }

        norms = [_remove_accents(l) for l in lines]

        for i, norm in enumerate(norms):
            nxt = lines[i + 1] if i + 1 < len(lines) else ""

            # Họ tên
            if (
                not result["ho_ten"]
                and ("ho va ten" in norm or "full name" in norm)
            ):
                result["ho_ten"] = nxt

            # CCCD
            if not result["so_cccd"]:
                m = re.search(r"\b\d{12}\b", lines[i])
                if m:
                    result["so_cccd"] = m.group()

            # Ngày cấp
            if (
                not result["ngay_cap"]
                and "ngay cap" in norm
            ):
                m = re.search(
                    r"\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}-\d{2}-\d{2}",
                    nxt
                )

                if m:
                    result["ngay_cap"] = m.group()

            # Nơi cấp
            if (
                not result["noi_cap"]
                and "noi cap" in norm
            ):
                result["noi_cap"] = nxt

        return result

    # =========================================================
    # CCCD PARSER
    # =========================================================

    

    def _parse_cccd(self, lines: List[str]) -> Dict[str, str]:
        result = {
            "ho_ten": "",
            "so_cccd": "",
            "ngay_cap": "",
            "noi_cap": "",
        }

        full_text = " ".join(lines)

        # ============================================
        # CCCD NUMBER
        # ============================================

        m = re.search(r"\b\d{12}\b", full_text)

        if m:
            result["so_cccd"] = m.group()

        # ============================================
        # NAME
        # ============================================

        candidates = []

        blacklist = [
            "can cuoc",
            "cccd",
            "noi sinh",
            "que quan",
            "thuong tru",
            "tam tru",
            "dan toc",
            "ton giao",
            "gioi tinh",
            "quoc tich",
            "viet nam",
            "bo cong an",
        ]

        for line in lines:
            stripped = line.strip()

            norm = _remove_accents(stripped)

            if any(b in norm for b in blacklist):
                continue

            if re.search(r"\d", stripped):
                continue

            words = stripped.split()

            if 2 <= len(words) <= 6:
                upper_score = 1 if stripped.upper() == stripped else 0

                candidates.append((
                    upper_score,
                    len(words),
                    stripped
                ))

        if candidates:
            candidates.sort(reverse=True)

            result["ho_ten"] = candidates[0][2]

        # ============================================
        # DATE
        # ============================================

        result["ngay_cap"] = ""

        for line in lines:
            norm = _remove_accents(line)

            # ưu tiên dòng có "ngay cap"
            if "ngay cap" in norm:
                m = re.search(r"\d{2}[\/\-]\d{2}[\/\-]\d{4}", line)
                if m:
                    result["ngay_cap"] = _normalize_date(m.group())
                    break

        # fallback nếu không tìm thấy context
        if not result["ngay_cap"]:
            dates = re.findall(r"\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b", full_text)

            # loại ngày sinh kiểu 2004 (heuristic nhẹ)
            filtered = [d for d in dates if not d.endswith("2004")]

            if filtered:
                result["ngay_cap"] = filtered[0]

        # ============================================
        # NOI CAP
        # ============================================

        for line in lines:
            norm = _remove_accents(line)

            if (
                "bo cong an" in norm
                or "cuc canh sat" in norm
            ):
                result["noi_cap"] = line
                break

        return result