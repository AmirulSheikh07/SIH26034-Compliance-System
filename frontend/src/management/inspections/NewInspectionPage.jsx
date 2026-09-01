import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, X, Play, Zap, SlidersHorizontal, ClipboardList,
  MapPin, User, Calendar, AlertCircle, Loader2, Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCAN_MODES = [
  { id: 'ai',     icon: Zap,              label: 'AI Auto-Scan',         sub: 'Full OCR pipeline'        },
  { id: 'hybrid', icon: SlidersHorizontal, label: 'Hybrid / Assisted',    sub: 'OCR + manual overrides'   },
  { id: 'manual', icon: ClipboardList,     label: 'Manual Entry',          sub: 'Declare all fields manually' },
];

const TODAY = new Date().toISOString().split('T')[0];

const FIELD_STYLE = `w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800
  text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500
  border-slate-300 dark:border-slate-700
  placeholder-slate-400 dark:placeholder-slate-500`;

const ERR_FIELD_STYLE = `w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800
  text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-rose-500
  border-rose-500`;

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function FieldInput({ label, name, value, onChange, error, placeholder, type = 'text', optional = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>}
        {!optional && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? ERR_FIELD_STYLE : FIELD_STYLE}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

function AuditMetaRow({ meta, onChange, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FieldInput
        label="Inspection Location"
        name="inspectionLocation"
        value={meta.inspectionLocation}
        onChange={onChange}
        error={errors.inspectionLocation}
        placeholder="e.g. BigBasket Warehouse, Delhi"
      />
      <FieldInput
        label="Inspector Name"
        name="inspectorName"
        value={meta.inspectorName}
        onChange={onChange}
        error={errors.inspectorName}
        placeholder="e.g. Ravi Sharma"
      />
      <FieldInput
        label="Inspection Date"
        name="inspectionDate"
        value={meta.inspectionDate}
        onChange={onChange}
        error={errors.inspectionDate}
        type="date"
      />
    </div>
  );
}

function DropZone({ images, isDragging, errors, onDragOver, onDragLeave, onDrop, onFileChange, onRemove }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Product / Label Image
        </h3>
        <span className="text-xs text-slate-400">{images.length} file(s) selected</span>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 scale-[1.01]'
            : errors.images
            ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
            <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Drag &amp; drop label images here, or{' '}
            <label className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline font-semibold">
              browse files
              <input type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
            </label>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, JPEG, WEBP · up to 10 MB each</p>
        </div>
      </div>
      {errors.images && <p className="text-xs text-rose-500">{errors.images}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 pt-1">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Scan Failed</p>
        <p className="text-xs mt-0.5 opacity-80">{message}</p>
      </div>
    </div>
  );
}

function SubmitButton({ isScanning, label = 'Start Scan' }) {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={isScanning}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing — this may take a moment…
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            {label}
          </>
        )}
      </button>
    </div>
  );
}

function InfoTip({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function NewInspectionPage() {
  const navigate = useNavigate();

  // ── Mode ────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState('ai');

  // ── Shared audit metadata ────────────────────────────────────────────────
  const [meta, setMeta] = useState({
    inspectionLocation: '',
    inspectorName: 'Inspector Admin',
    inspectionDate: TODAY,
  });

  // ── Shared image state ───────────────────────────────────────────────────
  const [images, setImages]     = useState([]);
  const [isDragging, setDragging] = useState(false);

  // ── Hybrid overrides ─────────────────────────────────────────────────────
  const [overrides, setOverrides] = useState({
    mrp: '', net_quantity: '', manufacturing_date: '',
    manufacturer: '', address: '', consumer_care: '', country_of_origin: '',
  });

  // ── Manual entry fields ──────────────────────────────────────────────────
  const [manual, setManual] = useState({
    manufacturer: '', address: '', mrp: '', net_quantity: '',
    manufacturing_date: '', consumer_care: '', country_of_origin: '',
  });

  // ── UI state ─────────────────────────────────────────────────────────────
  const [errors, setErrors]         = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── File handling ────────────────────────────────────────────────────────
  const addFiles = (files) => {
    const valid = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ id: Math.random().toString(36).slice(2), file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...valid]);
    setErrors((prev) => ({ ...prev, images: null }));
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleOverrideChange = (e) => {
    const { name, value } = e.target;
    setOverrides((p) => ({ ...p, [name]: value }));
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManual((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  // ── Navigation helper ────────────────────────────────────────────────────
  const goToAnalysis = (result, imagePreviewUrl = null) => {
    navigate(`/inspection/${result.scan_id}/analysis`, {
      state: { scanResult: result, imagePreviewUrl },
    });
  };

  // ── POST helper ──────────────────────────────────────────────────────────
  const postScan = async (imageFile) => {
    const fd = new FormData();
    fd.append('file', imageFile, imageFile.name);
    const res = await fetch('http://127.0.0.1:8000/api/v1/scan', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Server error ${res.status}`);
    }
    return res.json();
  };

  // ── Validation helpers ───────────────────────────────────────────────────
  const validateMeta = (errs) => {
    if (!meta.inspectionLocation.trim()) errs.inspectionLocation = 'Required';
    if (!meta.inspectorName.trim())      errs.inspectorName = 'Required';
    if (!meta.inspectionDate)            errs.inspectionDate = 'Required';
  };

  const validateImages = (errs) => {
    if (images.length === 0) errs.images = 'At least one label image is required';
  };

  const validateManual = (errs) => {
    const req = ['manufacturer', 'address', 'mrp', 'net_quantity', 'country_of_origin'];
    req.forEach((k) => {
      if (!manual[k]?.trim()) errs[k] = 'This field is mandatory under LMPC rules';
    });
  };

  // ── Submit handlers ──────────────────────────────────────────────────────

  /** AI Auto-Scan: pure OCR, minimal metadata */
  const handleAiSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    validateMeta(errs);
    validateImages(errs);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsScanning(true);
    setSubmitError('');
    try {
      const result = await postScan(images[0].file);
      goToAnalysis(result, URL.createObjectURL(images[0].file));
    } catch (err) {
      setSubmitError(err.message || 'Could not reach the scanning service.');
    } finally {
      setIsScanning(false);
    }
  };

  /** Hybrid: run OCR then merge any non-empty overrides on top */
  const handleHybridSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    validateMeta(errs);
    validateImages(errs);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsScanning(true);
    setSubmitError('');
    try {
      const result = await postScan(images[0].file);

      // Merge: override only fields the inspector has explicitly filled in
      const merged = { ...result };
      merged.product = { ...(result.product || {}) };
      Object.entries(overrides).forEach(([k, v]) => {
        if (v.trim()) merged.product[k] = v.trim();
      });
      merged._hybridOverridesApplied = Object.entries(overrides)
        .filter(([, v]) => v.trim())
        .map(([k]) => k);

      goToAnalysis(merged, URL.createObjectURL(images[0].file));
    } catch (err) {
      setSubmitError(err.message || 'Could not reach the scanning service.');
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Manual Entry: skip OCR entirely — build a synthetic scanResult that
   * mimics the API shape so InspectionAnalysisPage renders without changes.
   * Each mandatory field that is filled = PASS check; missing = FAIL + violation.
   */
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    validateMeta(errs);
    validateManual(errs);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const MANDATORY = ['manufacturer', 'address', 'mrp', 'net_quantity', 'country_of_origin'];
    const OPTIONAL  = ['manufacturing_date', 'consumer_care'];

    const checks = [];
    const violations = [];

    [...MANDATORY, ...OPTIONAL].forEach((field) => {
      const value = manual[field]?.trim();
      const isMandatory = MANDATORY.includes(field);

      if (value) {
        checks.push({ field, status: 'PASS', message: `${field} declared: "${value}"`, confidence: 1.0, confidence_level: 'HIGH', review_required: false, bounding_box: null });
      } else if (isMandatory) {
        checks.push({ field, status: 'FAIL', message: `${field} is missing — mandatory under LMPC Rule 6`, confidence: null, confidence_level: null, review_required: true, bounding_box: null });
        violations.push({ rule_id: `LMPC_MANDATORY_${field.toUpperCase()}`, field, severity: 'CRITICAL', message: `Mandatory declaration "${field}" is absent from the product label.`, confidence: null, confidence_level: null, bounding_box: null });
      }
    });

    const passed = checks.filter((c) => c.status === 'PASS').length;
    const failed = checks.filter((c) => c.status === 'FAIL').length;
    const overall_status = failed === 0 ? 'COMPLIANT' : 'NON_COMPLIANT';

    const syntheticResult = {
      scan_id:        `MANUAL-${Date.now()}`,
      filename:       'manual-entry',
      overall_status,
      product:        { ...manual },
      checks,
      violations,
      summary: { total_checks: checks.length, passed_checks: passed, failed_checks: failed, total_violations: violations.length },
    };

    navigate(`/inspection/${syntheticResult.scan_id}/analysis`, {
      state: { scanResult: syntheticResult, imagePreviewUrl: null },
    });
  };

  const submitHandlers = { ai: handleAiSubmit, hybrid: handleHybridSubmit, manual: handleManualSubmit };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* Page header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Inspection</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Choose an inspection mode, upload label images, and start Legal Metrology compliance verification.
        </p>
      </div>

      {/* ── 3-Segment Mode Switcher ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 flex gap-1">
        {SCAN_MODES.map(({ id, icon: Icon, label, sub }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); setErrors({}); setSubmitError(''); }}
              className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-lg text-left transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-200' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${active ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{label}</p>
                <p className={`text-[10px] truncate ${active ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>{sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Mode panels ─────────────────────────────────────────────────── */}

      {/* AI AUTO-SCAN */}
      {mode === 'ai' && (
        <form onSubmit={handleAiSubmit} className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <InfoTip>
              The AI pipeline will automatically extract all mandatory LMPC declarations from your uploaded image using OCR. No manual input required.
            </InfoTip>
            <AuditMetaRow meta={meta} onChange={handleMetaChange} errors={errors} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <DropZone
              images={images} isDragging={isDragging} errors={errors}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onFileChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
              onRemove={removeImage}
            />
          </div>

          <ErrorBanner message={submitError} />
          <SubmitButton isScanning={isScanning} label="⚡ Run AI Scan" />
        </form>
      )}

      {/* HYBRID / ASSISTED */}
      {mode === 'hybrid' && (
        <form onSubmit={handleHybridSubmit} className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <InfoTip>
              Upload the label image for OCR extraction, then optionally override specific fields if the label is damaged or partially illegible.
            </InfoTip>
            <AuditMetaRow meta={meta} onChange={handleMetaChange} errors={errors} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <DropZone
              images={images} isDragging={isDragging} errors={errors}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onFileChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
              onRemove={removeImage}
            />
          </div>

          {/* Manual override fields */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Manual Overrides
                <span className="ml-2 text-xs font-normal text-slate-400">— leave blank to use OCR value</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'mrp',              placeholder: 'e.g. ₹120',             label: 'MRP'                  },
                { name: 'net_quantity',     placeholder: 'e.g. 500 g',            label: 'Net Quantity'         },
                { name: 'manufacturing_date', placeholder: 'e.g. 08/2026',        label: 'Mfg / Packing Date'  },
                { name: 'manufacturer',     placeholder: 'e.g. ITC Ltd, Kolkata', label: 'Manufacturer / Packer' },
                { name: 'address',          placeholder: 'e.g. Plot 4, Delhi',    label: 'Address'              },
                { name: 'consumer_care',    placeholder: 'e.g. 1800-xxx-xxxx',    label: 'Consumer Care'        },
                { name: 'country_of_origin', placeholder: 'e.g. India',           label: 'Country of Origin'    },
              ].map(({ name, placeholder, label }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {label}
                    <span className="ml-1 text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={overrides[name]}
                    onChange={handleOverrideChange}
                    placeholder={placeholder}
                    className={`${FIELD_STYLE} border-amber-300 dark:border-amber-800/60 focus:ring-amber-500 bg-amber-50/30 dark:bg-amber-950/10`}
                  />
                </div>
              ))}
            </div>
          </div>

          <ErrorBanner message={submitError} />
          <SubmitButton isScanning={isScanning} label="🔍 Run Hybrid Scan" />
        </form>
      )}

      {/* MANUAL ENTRY */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <InfoTip>
              Declare all Legal Metrology fields manually. No image is required. Each declaration will be validated against LMPC Rule 6 mandatory requirements.
            </InfoTip>
            <AuditMetaRow meta={meta} onChange={handleMetaChange} errors={errors} />
          </div>

          {/* Mandatory declarations */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                LMPC Mandatory Declarations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput label="Manufacturer / Packer / Importer" name="manufacturer" value={manual.manufacturer} onChange={handleManualChange} error={errors.manufacturer} placeholder="e.g. ITC Limited, Kolkata" />
              <FieldInput label="Address" name="address" value={manual.address} onChange={handleManualChange} error={errors.address} placeholder="e.g. Plot 42, Phase II, Delhi" />
              <FieldInput label="MRP (incl. all taxes)" name="mrp" value={manual.mrp} onChange={handleManualChange} error={errors.mrp} placeholder="e.g. ₹ 120.00" />
              <FieldInput label="Net Quantity" name="net_quantity" value={manual.net_quantity} onChange={handleManualChange} error={errors.net_quantity} placeholder="e.g. 500 g" />
              <FieldInput label="Country of Origin" name="country_of_origin" value={manual.country_of_origin} onChange={handleManualChange} error={errors.country_of_origin} placeholder="e.g. India" />
            </div>
          </div>

          {/* Optional declarations */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Optional Declarations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput optional label="Mfg / Packing Date" name="manufacturing_date" value={manual.manufacturing_date} onChange={handleManualChange} error={errors.manufacturing_date} placeholder="e.g. 08/2026" />
              <FieldInput optional label="Consumer Care Details" name="consumer_care" value={manual.consumer_care} onChange={handleManualChange} error={errors.consumer_care} placeholder="e.g. 1800-11-2233" />
            </div>
          </div>

          <ErrorBanner message={submitError} />
          <SubmitButton isScanning={false} label="📝 Validate Manual Entry" />
        </form>
      )}
    </div>
  );
}

