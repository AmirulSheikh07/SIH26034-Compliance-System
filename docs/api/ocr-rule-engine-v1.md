# OCR → Rule Engine API Contract V1

## 1. Purpose

This document defines the JSON format exchanged between:

- Member 1: OCR + AI/Vision
- Member 2: Legal Metrology Rule Engine

The purpose is to ensure both modules can be developed independently and integrated later.

---

## 2. Version

Schema Version: `1.0`

---

## 3. Input JSON

Member 1 will provide extracted product information in the following format:

```json
{
  "schema_version": "1.0",
  "scan_id": "SCAN-001",

  "product": {
    "manufacturer": "ABC Foods Pvt Ltd",
    "address": "Nagpur, Maharashtra",
    "mrp": "₹120",
    "net_quantity": "500 g",
    "manufacturing_date": "06/2026",
    "consumer_care": "18001234567",
    "country_of_origin": "India"
  },

  "confidence": {
    "manufacturer": 0.98,
    "address": 0.96,
    "mrp": 0.99,
    "net_quantity": 0.97,
    "manufacturing_date": 0.94,
    "consumer_care": 0.91,
    "country_of_origin": 0.98
  },

  "bounding_boxes": {
    "mrp": [120, 450, 300, 500]
  }
}
