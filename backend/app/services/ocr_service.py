import base64
import io
import logging
from PIL import Image

logger = logging.getLogger(__name__)

def process_image_ocr(base64_str: str = None, provided_extracted_text: str = None, file_name: str = "image.png") -> str:
    # 1. If base64 binary payload is provided, process with PIL and Tesseract OCR
    if base64_str and len(base64_str.strip()) > 0:
        try:
            # Strip header prefix if data URI is passed (e.g., data:image/png;base64,...)
            clean_b64 = base64_str
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",", 1)[1]
                
            image_bytes = base64.b64decode(clean_b64)
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size

            # Attempt pytesseract OCR extraction
            try:
                import pytesseract
                extracted = pytesseract.image_to_string(image)
                if extracted and len(extracted.strip()) > 0:
                    # OCR Normalization: clean trailing whitespace and linebreaks
                    cleaned = " ".join(extracted.split())
                    return cleaned
            except Exception as ocr_err:
                logger.warning(f"pytesseract extraction unavailable or failed for {file_name}: {ocr_err}")

            if provided_extracted_text and len(provided_extracted_text.strip()) > 0:
                return provided_extracted_text.strip()

            return f"[OCR Processed ({file_name}, {width}x{height}px)]: Image decoded."

        except Exception as err:
            logger.error(f"Image processing failed for {file_name}: {err}")

    # 2. Fallback to provided extracted text if available
    if provided_extracted_text and len(provided_extracted_text.strip()) > 0:
        return provided_extracted_text.strip()

    return f"[Image Processing ({file_name})]: No image payload or OCR text extracted."

