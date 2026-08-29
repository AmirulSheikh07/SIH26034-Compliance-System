"""
Stage: OCR engine wrapper around PaddleOCR.

Responsibility: take an image (path or numpy array) and return a flat list
of (text, confidence, bounding_box) lines. Nothing else -- field extraction
happens in extractor.py, never here. This isolation means if PaddleOCR's
API changes again (it already has once), only this file needs to change.
"""

from typing import List, Union
import numpy as np

from paddleocr import PaddleOCR

from .types import OcrLine


class OcrEngine:
    """Thin, version-tolerant wrapper around PaddleOCR."""

    def __init__(self, lang: str = "en"):
        # use_doc_orientation_classify / use_doc_unwarping: off, because
        # these are meant for scanned documents, not product photos.
        #
        # enable_mkldnn=False: works around a Windows CPU bug where the
        # newer Paddle PIR executor + oneDNN crashes on PP-OCRv6 detection
        # ops (NotImplementedError: ConvertPirAttribute2RuntimeAttribute...).
        # If you're not hitting that error, you can try enable_mkldnn=True
        # for faster inference.
        self._ocr = PaddleOCR(
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=True,
            lang=lang,
            enable_mkldnn=False,
        )

    def run(self, image: Union[str, np.ndarray]) -> List[OcrLine]:
        """
        Run OCR on an image path or a numpy array (e.g. after OpenCV
        preprocessing). Returns lines roughly top-to-bottom, left-to-right,
        matching PaddleOCR's own detection order.
        """
        result = self._ocr.predict(image)

        lines: List[OcrLine] = []
        for res in result:
            texts = res.get("rec_texts", [])
            scores = res.get("rec_scores", [])
            polys = res.get("rec_polys", res.get("dt_polys", [None] * len(texts)))

            for text, score, box in zip(texts, scores, polys):
                if not text.strip():
                    continue  # skip blank detections -- pure noise for extraction
                box_list = box.tolist() if hasattr(box, "tolist") else box
                lines.append(OcrLine(text=text, confidence=float(score), box=box_list))

        return lines
