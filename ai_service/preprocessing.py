"""
Stage 2: OpenCV preprocessing before OCR (project spec section 4).

Kept deliberately conservative. PaddleOCR's own detection model already
handles a lot of raw-photo noise, so we only apply operations that help
in practice -- not every technique available, per spec section 4.
"""

import cv2
import numpy as np


def load_image(path: str) -> np.ndarray:
    image = cv2.imread(path)
    if image is None:
        raise ValueError(f"Could not read image at path: {path}")
    return image


def resize_if_needed(image: np.ndarray, max_dim: int = 2000) -> np.ndarray:
    """Downscale very large photos. Speeds up OCR without hurting accuracy."""
    h, w = image.shape[:2]
    scale = max_dim / max(h, w)
    if scale < 1.0:
        image = cv2.resize(
            image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA
        )
    return image


def denoise(image: np.ndarray) -> np.ndarray:
    """Off by default -- slow, and can blur small print. Use for known-grainy photos."""
    return cv2.fastNlMeansDenoisingColored(image, None, 5, 5, 7, 21)


def improve_contrast(image: np.ndarray) -> np.ndarray:
    """
    CLAHE (adaptive contrast) on the luminance channel. Helps with the
    low-light / glare-heavy product photos this project will see a lot of,
    without blowing out already-bright regions.
    """
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def preprocess(
    image_path: str,
    *,
    denoise_image: bool = False,
    boost_contrast: bool = False,
) -> np.ndarray:
    """
    Full preprocessing pipeline for one image path. Returns an OpenCV image (numpy array).

    NOTE: boost_contrast defaults to False. Real testing showed CLAHE
    contrast boosting *hurt* OCR accuracy on a real product photo
    (clean 'COMPOSITION: Each 100 g...' at 0.97 confidence became garbled
    'COMPOSTON:Eac100gpreared' with contrast boost on). Preprocessing does
    not universally help -- it depends on the image. Only enable per-image
    once you've tested it actually improves results (spec section 13).
    """
    image = load_image(image_path)
    image = resize_if_needed(image)
    if denoise_image:
        image = denoise(image)
    if boost_contrast:
        image = improve_contrast(image)
    return image
