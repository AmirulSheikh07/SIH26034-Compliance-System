from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database.database import Base


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    """Represents an inspector / admin user of the compliance system."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False, default="inspector")  # e.g. inspector | admin
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    scans = relationship("Scan", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} name={self.name!r} role={self.role!r}>"


# ---------------------------------------------------------------------------
# Scan
# ---------------------------------------------------------------------------
class Scan(Base):
    """Represents a single label-scan job submitted by an inspector."""

    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_path = Column(String(512), nullable=False)
    overall_status = Column(String(32), nullable=False, default="PENDING")  # COMPLIANT | NON_COMPLIANT | PENDING
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Rule-engine summary counters (populated after compliance check)
    summary_total_checks = Column(Integer, nullable=True)
    summary_passed_checks = Column(Integer, nullable=True)
    summary_failed_checks = Column(Integer, nullable=True)
    summary_total_violations = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="scans")
    extracted_data = relationship(
        "ExtractedData", back_populates="scan", cascade="all, delete-orphan"
    )
    checks = relationship(
        "Check", back_populates="scan", cascade="all, delete-orphan"
    )
    violations = relationship(
        "Violation", back_populates="scan", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Scan id={self.id} status={self.overall_status!r}>"


# ---------------------------------------------------------------------------
# ExtractedData
# ---------------------------------------------------------------------------
class ExtractedData(Base):
    """
    Stores individual fields extracted from a label image via OCR / ML.
    bounding_box is stored as a JSON string: e.g. {"x": 10, "y": 20, "w": 100, "h": 30}
    """

    __tablename__ = "extracted_data"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    field_name = Column(String(255), nullable=False)   # e.g. "manufacturing_date"
    extracted_text = Column(Text, nullable=True)        # raw OCR output
    confidence_score = Column(Float, nullable=True)     # 0.0 – 1.0
    bounding_box = Column(String(512), nullable=True)   # JSON string

    # Relationships
    scan = relationship("Scan", back_populates="extracted_data")

    def __repr__(self) -> str:
        return (
            f"<ExtractedData id={self.id} field={self.field_name!r} "
            f"confidence={self.confidence_score}>"
        )


# ---------------------------------------------------------------------------
# Check
# ---------------------------------------------------------------------------
class Check(Base):
    """
    Stores the result of a single per-field compliance check produced by
    the rule engine's check_compliance() function.
    """

    __tablename__ = "checks"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    field = Column(String(255), nullable=False)               # e.g. "mrp", "manufacturing_date"
    status = Column(String(16), nullable=False)               # PASS | FAIL
    message = Column(Text, nullable=True)                     # human-readable check result
    confidence = Column(Float, nullable=True)                 # 0.0 – 1.0 from OCR
    confidence_level = Column(String(16), nullable=True)      # HIGH | MEDIUM | LOW
    review_required = Column(Boolean, nullable=True)          # True when confidence is LOW
    bounding_box = Column(JSON, nullable=True)                # {"x", "y", "w", "h"}

    # Relationships
    scan = relationship("Scan", back_populates="checks")

    def __repr__(self) -> str:
        return f"<Check id={self.id} field={self.field!r} status={self.status!r}>"


# ---------------------------------------------------------------------------
# Violation
# ---------------------------------------------------------------------------
class Violation(Base):
    """
    Records a specific compliance rule violation produced by the rule engine.
    Each violation corresponds to a failed mandatory or format rule.
    """

    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    rule_id = Column(String(128), nullable=False)             # e.g. "LM-MRP-001"
    field = Column(String(255), nullable=False)               # e.g. "mrp"
    severity = Column(String(32), nullable=False)             # HIGH | MEDIUM | LOW
    message = Column(Text, nullable=True)                     # human-readable explanation
    confidence = Column(Float, nullable=True)                 # 0.0 – 1.0 from OCR
    confidence_level = Column(String(16), nullable=True)      # HIGH | MEDIUM | LOW
    bounding_box = Column(JSON, nullable=True)                # {"x", "y", "w", "h"}

    # Relationships
    scan = relationship("Scan", back_populates="violations")

    def __repr__(self) -> str:
        return f"<Violation id={self.id} rule_id={self.rule_id!r} field={self.field!r}>"
