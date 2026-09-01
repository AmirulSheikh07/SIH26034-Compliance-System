import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Check,
  X,
  ShieldCheck,
  FileCheck2,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** snake_case → Title Case label */
const fieldLabel = (key) =>
  String(key)
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/**
 * Build the declarations list from the real engine result.
 *
 * The engine returns `checks[]` shaped like:
 *   { field, status, message, confidence, confidence_level, review_required, bounding_box }
 *
 * We also pull in the `product` object so we can show the extracted value.
 */
function buildDeclarations(scanResult) {
  const checks     = scanResult?.checks     ?? [];
  const product    = scanResult?.product    ?? {};
  const violations = scanResult?.violations ?? [];

  // Build a quick lookup: field → violation (if any)
  const violationByField = Object.fromEntries(
    violations.map((v) => [v.field, v])
  );

  return checks.map((check, idx) => {
    const vio = violationByField[check.field];
    // Derive a user-facing status: if a violation exists for this field, FAIL; else check.status
    const displayStatus = check.status === 'FAIL' ? 'FAIL'
                        : check.review_required   ? 'WARNING'
                        : 'PASS';

    return {
      id:             `dec_${idx}`,
      field:          check.field,
      name:           fieldLabel(check.field),
      extractedValue: product[check.field] ?? '—',
      status:         displayStatus,
      confidence:     check.confidence != null ? Math.round(check.confidence * 100) : null,
      explanation:    check.message ?? '',
      severity:       vio?.severity ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InspectionDeclarationsPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State passed from InspectionAnalysisPage via navigate(..., { state })
  const scanResult      = location.state?.scanResult      ?? null;
  const imagePreviewUrl = location.state?.imagePreviewUrl ?? null;

  // Build live declaration rows from real data (or empty array)
  const [declarations, setDeclarations] = useState(() =>
    scanResult ? buildDeclarations(scanResult) : []
  );

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Summary counters (re-derived from state so they update after edits)
  const passCount    = declarations.filter((d) => d.status === 'PASS').length;
  const failCount    = declarations.filter((d) => d.status === 'FAIL').length;
  const warningCount = declarations.filter((d) => d.status === 'WARNING').length;
  const overallStatus =
    failCount > 0    ? 'NON-COMPLIANT'
    : warningCount > 0 ? 'NEEDS REVIEW'
    : declarations.length > 0 ? 'COMPLIANT'
    : scanResult?.overall_status ?? '—';

  // Shared navigation state — always carry context forward
  const navState = { state: { scanResult, imagePreviewUrl } };

  const handleEdit   = (item) => { setEditingId(item.id); setTempValue(item.extractedValue); };
  const handleCancel = ()     => { setEditingId(null);    setTempValue(''); };
  const handleSave   = (id)   => {
    setDeclarations((prev) =>
      prev.map((item) => item.id === id ? { ...item, extractedValue: tempValue } : item)
    );
    setEditingId(null);
    setTempValue('');
  };

  // ── No-data guard ─────────────────────────────────────────────────────────
  if (!scanResult) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-500 dark:text-slate-400">
        <Info className="w-8 h-8" />
        <p className="text-sm font-medium text-center max-w-xs">
          No scan data for inspection <strong>#{id}</strong>.<br />
          Please{' '}
          <button
            onClick={() => navigate(`/inspection/${id}/analysis`)}
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2"
          >
            return to the Analysis page
          </button>{' '}
          or start a new scan.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Navigation header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/inspection/${id}/analysis`, navState)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </button>

        <button
          onClick={() => navigate(`/inspection/${id}/violations`, navState)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all text-sm"
        >
          <span>View Violations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Header banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Declaration Review
              </h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${
                overallStatus === 'NON-COMPLIANT'
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : overallStatus === 'NEEDS REVIEW'
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}>
                {overallStatus === 'NON-COMPLIANT' ? <XCircle className="w-3.5 h-3.5" />
                  : overallStatus === 'NEEDS REVIEW' ? <AlertTriangle className="w-3.5 h-3.5" />
                  : <CheckCircle2 className="w-3.5 h-3.5" />}
                {overallStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scan ID:&nbsp;<strong className="text-slate-700 dark:text-slate-300">#{id}</strong>
              &nbsp;·&nbsp;File:&nbsp;
              <strong className="text-slate-700 dark:text-slate-300">{scanResult.filename ?? '—'}</strong>
              &nbsp;·&nbsp;Mandatory Legal Metrology Audit
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Legal Metrology Act, 2009 Verification</span>
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { label: 'Total Checked', value: declarations.length, cls: 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white' },
            { label: 'Passed',        value: passCount,           cls: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' },
            { label: 'Failed',        value: failCount,           cls: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-400' },
            { label: 'Warnings',      value: warningCount,        cls: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-400' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`p-3 rounded-lg border flex items-center justify-between ${cls}`}>
              <span className="text-xs font-medium">{label}</span>
              <span className="text-lg font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Declarations table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Extracted Declarations</h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Inspect OCR values · correct if needed
          </span>
        </div>

        {declarations.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 dark:text-slate-500">
            No declarations were extracted from this scan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Declaration Field</th>
                  <th className="py-3.5 px-4">Extracted Value</th>
                  <th className="py-3.5 px-4 text-center">Confidence</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Compliance Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {declarations.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">

                      {/* Field name */}
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {item.name}
                        {item.severity && (
                          <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            item.severity === 'CRITICAL' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            : item.severity === 'HIGH'   ? 'bg-orange-50 text-orange-600 border-orange-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {item.severity}
                          </span>
                        )}
                      </td>

                      {/* Extracted value / inline editor */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full text-sm p-1.5 border border-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            autoFocus
                          />
                        ) : (
                          <span className={`font-medium break-words ${
                            item.extractedValue === '—'
                              ? 'text-rose-500 dark:text-rose-400 italic'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.extractedValue}
                          </span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="py-4 px-4 text-center">
                        {item.confidence != null ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            item.confidence < 70
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.confidence}%
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {item.status === 'PASS' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        )}
                        {item.status === 'FAIL' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                        {item.status === 'WARNING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                          </span>
                        )}
                      </td>

                      {/* Compliance notes */}
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                        {item.explanation || '—'}
                      </td>

                      {/* Edit actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSave(item.id)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer action bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Edits are saved locally for this inspector session only</span>
        </div>
        <button
          onClick={() => navigate(`/inspection/${id}/violations`, navState)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-all text-sm"
        >
          <span>View Violations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
