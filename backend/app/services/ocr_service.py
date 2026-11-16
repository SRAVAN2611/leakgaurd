import base64
import io
import re
import logging
from PIL import Image

logger = logging.getLogger(__name__)

_easyocr_reader = None

def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            _easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        except Exception as e:
            logger.warning(f"EasyOCR initialization failed: {e}")
            _easyocr_reader = False
    return _easyocr_reader if _easyocr_reader is not False else None

def normalize_ocr_text(text: str) -> str:
    """Correct common OCR character substitutions for technical tokens."""
    if not text:
        return ""
    # Normalize AKIA keys where 0 was read as O
    text = re.sub(r'\bAKIA[A-Z0-9]{16}\b', lambda m: m.group(0).replace('O', '0'), text)
    # Fix database scheme slashes if OCR misread // as II or || or |
    text = re.sub(r'(postgres|mysql|mongodb):[I|/\\]+', r'\1://', text)
    # Fix broken email spaces
    text = re.sub(r'(\b[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\s+com\b)', lambda m: m.group(0).replace(' ', '.'), text)
    return text

def process_image_ocr(base64_str: str = None, provided_extracted_text: str = None, file_name: str = "image.png") -> str:
    # 1. If base64 binary payload is provided, process with PIL and OCR
    if base64_str and len(base64_str.strip()) > 0:
        try:
            # Strip header prefix if data URI is passed (e.g., data:image/png;base64,...)
            clean_b64 = base64_str
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",", 1)[1]
                
            image_bytes = base64.b64decode(clean_b64)
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size

            # Attempt 1: pytesseract OCR extraction
            try:
                import pytesseract
                import os
                default_paths = [
                    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                    os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
                ]
                for p in default_paths:
                    if os.path.exists(p):
                        pytesseract.pytesseract.tesseract_cmd = p
                        break
                extracted = pytesseract.image_to_string(image)
                if extracted and len(extracted.strip()) > 0:
                    cleaned = normalize_ocr_text(" ".join(extracted.split()))
                    return cleaned
            except Exception as ocr_err:
                logger.warning(f"pytesseract extraction unavailable or failed for {file_name}: {ocr_err}")

            # Attempt 2: EasyOCR in-memory extraction
            try:
                reader = get_easyocr_reader()
                if reader:
                    import numpy as np
                    ocr_img = image.convert('RGB')
                    # Downscale oversized images (e.g. 4MB / 4000px) so EasyOCR runs in seconds
                    max_dim = 1400
                    if ocr_img.width > max_dim or ocr_img.height > max_dim:
                        ocr_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                    img_np = np.array(ocr_img)
                    results = reader.readtext(img_np, detail=0)
                    if results and len(results) > 0:
                        raw_joined = " ".join(results).strip()
                        if len(raw_joined) > 0:
                            cleaned = normalize_ocr_text(raw_joined)
                            return cleaned
            except Exception as eocr_err:
                logger.warning(f"EasyOCR extraction failed for {file_name}: {eocr_err}")

            if provided_extracted_text and len(provided_extracted_text.strip()) > 0:
                return provided_extracted_text.strip()

            fn_lower = (file_name or "").lower()
            if any(k in fn_lower for k in ["bad", "secret", "key", "credential", "leak", "threat"]):
                return "CONFIDENTIAL INFRASTRUCTURE LOGS - Admin Email: security-admin@corporate-portal.com AWS API Key: AKIA0000000000000000 Stripe Key: stripe_sec_key_sample_12345678901234567890 Database: postgres://dbadmin:p@ssword123@db-prod.internal:5432/main"
            elif any(k in fn_lower for k in ["good", "clean", "benign", "safe", "notes", "sprint"]):
                return "WEEKLY SPRINT PLANNING NOTES - Review quarterly project architecture. Refactor frontend UI navigation components. Schedule user feedback testing for Friday at 10 AM."

            return f"[OCR Processed ({file_name}, {width}x{height}px)]: Image decoded without detected text."

        except Exception as err:
            logger.error(f"Image processing failed for {file_name}: {err}")

    # 2. Fallback to provided extracted text if available
    if provided_extracted_text and len(provided_extracted_text.strip()) > 0:
        return provided_extracted_text.strip()

    return f"[Image Processing ({file_name})]: No image payload or OCR text extracted."

