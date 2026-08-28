# SIH26034 – Legal Metrology Compliance System

> **Smart software system for automated compliance checking of packaged commodities under the Legal Metrology (Packaged Commodities) Rules, 2011.**

## 📌 Problem Statement

**Problem Statement ID:** SIH26034

**Title:** Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.

**Organization:** Ministry of Consumer Affairs, Food & Public Distribution

**Department:** Department of Consumer Affairs (DoCA)

**Category:** Software

**Theme:** Agriculture, FoodTech & Rural Development

---

## 🎯 Objective

The system aims to automatically analyze packaged commodity labels and product images to identify mandatory declarations and detect possible non-compliance with the Legal Metrology (Packaged Commodities) Rules, 2011.

The system will help reduce manual inspection effort and provide enforcement officials with structured compliance reports.

---

## 🚀 Key Features

- 📷 Product image and label scanning
- 🔍 OCR-based text extraction
- 🤖 AI/Vision-based information extraction
- 📋 Detection of mandatory declarations
- ⚖️ Rule-based Legal Metrology compliance checking
- 💰 MRP validation
- 📦 Net quantity validation
- 📅 Manufacturing date validation
- ☎️ Consumer-care information validation
- 🌍 Country-of-origin detection
- 🔎 Confidence score analysis
- 📍 Bounding-box based evidence
- ⚠️ Violation detection and severity classification
- 📊 Compliance dashboard
- 📄 Compliance report generation
- 🗂️ Product and inspection history

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │ Dashboard & Reports │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       BACKEND       │
                    │   APIs & Database   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    OCR + AI/VISION  │
                    │ Image Processing    │
                    └──────────┬──────────┘
                               │
                         Structured JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │    RULE ENGINE      │
                    │ Legal Metrology     │
                    │ Compliance Checks   │
                    └──────────┬──────────┘
                               │
                       Compliance Result
                               │
                               ▼
                    ┌─────────────────────┐
                    │       DATABASE      │
                    │ History & Reports   │
                    └─────────────────────┘
