import React, { useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Box,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Human-readable label from snake_case key */
const fieldLabel = (key) =>
  key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * Convert bounding_box [x1,y1,x2,y2] to % positions relative to the
 * image's natural pixel dimensions so the overlay scales with the element.
 */
const bboxToPercent = (box, naturalW, naturalH) => {
  if (!box || box.length < 4 || !naturalW || !naturalH) return null;
  const [x1, y1, x2, y2] = box;
  return {
    left:   `${((x1 / naturalW) * 100).toFixed(2)}%`,
    top:    `${((y1 / naturalH) * 100).toFixed(2)}%`,
    width:  `${(((x2 - x1) / naturalW) * 100).toFixed(2)}%`,
    height: `${(((y2 - y1) / naturalH) * 100).toFixed(2)}%`,
  };
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }) {
  const ok = status === 'COMPLIANT';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold tracking-wide border ${
      ok
        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
    }`}>
      {ok ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
      {ok ? 'COMPLIANT' : 'NON-COMPLIANT'}
    </span>
  );
}

function ProductField({ label, value }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold truncate ${empty ? 'text-rose-500 dark:text-rose-400 italic' : 'text-slate-800 dark:text-slate-200'}`}>
        {empty ? 'Not detected' : value}
      </p>
    </div>
  );
}

function CheckItem({ item, isViolation }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="mt-0.5 shrink-0">
        {isViolation
          ? <XCircle className="w-4 h-4 text-rose-500" />
          : <CheckCircle className="w-4 h-4 text-emerald-500" />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {isViolation ? item.rule_id : fieldLabel(item.field)}
          {item.severity && (
            <span className="ml-2 text-[10px] font-semibold rounded px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              {item.severity}
            </span>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
        {item.confidence != null && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Confidence:&nbsp;{(item.confidence * 100).toFixed(0)}%
            {item.review_required && (
              <span className="ml-2 text-amber-600 dark:text-amber-500 font-semibold">· Review required</span>
            )}
          </p>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InspectionAnalysisPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const scanResult      = location.state?.scanResult      ?? null;
  const imagePreviewUrl = location.state?.imagePreviewUrl ?? null;

  const imgRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const handleImageLoad = () => {
    if (imgRef.current) {
      setNaturalSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
  };

  // No state — user navigated here directly without running a scan
  if (!scanResult) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500 dark:text-slate-400">
        <Info className="w-8 h-8" />
        <p className="text-sm font-medium text-center max-w-xs">
          No scan result found for inspection <strong>#{id}</strong>.<br />
          Please start a new scan from the{' '}
          <button onClick={() => navigate('/inspection/new')} className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">
            New Inspection
          </button>{' '}page.
        </p>
      </div>
    );
  }

  const { overall_status, product = {}, checks = [], violations = [], summary = {} } = scanResult;
  const passedChecks = checks.filter((c) => c.status === 'PASS');
  const failedChecks = checks.filter((c) => c.status === 'FAIL');

  const summaryCards = [
    { label: 'Total Checks', value: summary.total_checks     ?? checks.length,      color: 'slate'   },
    { label: 'Passed',       value: summary.passed_checks    ?? passedChecks.length, color: 'emerald' },
    { label: 'Failed',       value: summary.failed_checks    ?? failedChecks.length, color: 'rose'    },
    { label: 'Violations',   value: summary.total_violations ?? violations.length,   color: 'amber'   },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Compliance Analysis</h1>
            <StatusBadge status={overall_status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scan ID:&nbsp;<strong className="text-slate-700 dark:text-slate-300">#{id}</strong>
            &nbsp;·&nbsp;File:&nbsp;
            <strong className="text-slate-700 dark:text-slate-300">{scanResult.filename || '—'}</strong>
          </p>
        </div>
        <button
          onClick={() => navigate(`/inspection/${id}/declarations`, { state: { scanResult, imagePreviewUrl } })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          Review Declarations <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 border-l-4 border-l-${color}-500 shadow-sm p-4`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider text-${color}-500`}>{label}</p>
            <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: image + bounding-box overlay */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Box className="w-4 h-4 text-slate-500" />
            Evidence Overlay
            <span className="text-[10px] font-normal text-slate-400 ml-1">(green = PASS · red = FAIL)</span>
          </h3>

          {imagePreviewUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
              <img
                ref={imgRef}
                src={imagePreviewUrl}
                alt="Uploaded label"
                className="w-full h-auto object-contain block"
                onLoad={handleImageLoad}
              />

              {/* Bounding-box overlays */}
              {naturalSize.w > 0 && checks.map((check, idx) => {
                if (!check.bounding_box) return null;
                const pos = bboxToPercent(check.bounding_box, naturalSize.w, naturalSize.h);
                if (!pos) return null;
                const pass = check.status === 'PASS';
                return (
                  <div
                    key={idx}
                    title={`${fieldLabel(check.field)}: ${check.message}`}
                    style={{ position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: pos.height }}
                    className={`border-2 rounded-sm pointer-events-none ${
                      pass
                        ? 'border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                        : 'border-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                    }`}
                  >
                    <span className={`absolute -top-5 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${pass ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {fieldLabel(check.field)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs p-8 text-center">
              No image preview available.
            </div>
          )}
        </div>

        {/* RIGHT: product data + check lists */}
        <div className="lg:col-span-7 space-y-5">

          {/* Extracted product fields */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-500" />
              Extracted Product Declarations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(product).map(([key, val]) => (
                <ProductField key={key} label={fieldLabel(key)} value={val} />
              ))}
              {Object.keys(product).length === 0 && (
                <p className="col-span-2 text-xs text-slate-400 italic">No product fields were extracted.</p>
              )}
            </div>
          </div>

          {/* Passed checks */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4" /> Passed Checks ({passedChecks.length})
            </h3>
            {passedChecks.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {passedChecks.map((c, i) => <CheckItem key={i} item={c} isViolation={false} />)}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No checks passed.</p>
            )}
          </div>

          {/* Violations */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" /> Violations ({violations.length})
            </h3>
            {violations.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {violations.map((v, i) => <CheckItem key={i} item={v} isViolation={true} />)}
              </ul>
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">
                ✓ No violations — label is fully compliant.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
