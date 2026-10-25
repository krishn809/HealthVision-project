import pdfplumber
import pytesseract
from pdf2image import convert_from_path
import cv2
import numpy as np
import os
from PIL import Image


# -----------------------------
# Preprocess (works for both PIL + OpenCV)
# -----------------------------
def preprocess_image(image):

    if isinstance(image, Image.Image):
        image = np.array(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)

    gray = cv2.bilateralFilter(gray, 9, 75, 75)

    _, thresh = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    kernel = np.ones((2, 2), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    return thresh


# -----------------------------
# Direct PDF extraction
# -----------------------------
def extract_text_from_pdf(pdf_path):

    full_text = ""

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
    except:
        pass

    return full_text


# -----------------------------
# OCR from PDF (fallback)
# -----------------------------
def extract_text_with_ocr(pdf_path):

    full_text = ""

    try:
        with pdfplumber.open(pdf_path) as pdf:

            for i in range(len(pdf.pages)):

                images = convert_from_path(
                    pdf_path,
                    dpi=300,   # ↑ better accuracy
                    first_page=i + 1,
                    last_page=i + 1
                )

                image = images[0]
                processed = preprocess_image(image)

                text = pytesseract.image_to_string(
                    processed,
                    config="--oem 3 --psm 6"
                )

                full_text += text + "\n"

    except:
        pass

    return full_text


# -----------------------------
# OCR from IMAGE (improved)
# -----------------------------
def extract_text_from_image(image_path):

    try:
        image = cv2.imread(image_path)

        if image is None:
            raise Exception("Invalid image path")

        processed = preprocess_image(image)

        configs = [
            "--oem 3 --psm 6",   # block of text
            "--oem 3 --psm 4",   # columns/table
            "--oem 3 --psm 11"   # sparse text
        ]

        best_text = ""

        for config in configs:
            text = pytesseract.image_to_string(processed, config=config)

            if len(text) > len(best_text):
                best_text = text

        return best_text

    except Exception as e:
        print("OCR Error:", e)
        return ""

# -----------------------------
# SMART ROUTER
# -----------------------------
def extract_text(file_path):

    ext = os.path.splitext(file_path)[1].lower()

    # Supported image formats
    image_exts = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]

    if ext == ".pdf":

        text = extract_text_from_pdf(file_path)

        # fallback to OCR if empty
        if not text.strip():
            text = extract_text_with_ocr(file_path)

    elif ext in image_exts:

        text = extract_text_from_image(file_path)

    else:
        raise ValueError("Unsupported file format")

    return text