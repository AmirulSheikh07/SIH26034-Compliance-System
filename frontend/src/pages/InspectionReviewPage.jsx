import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  ShieldAlert, 
  FileCheck, 
  Save, 
  ClipboardCheck, 
  Check, 
  RotateCcw,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const INITIAL_DECLARATIONS = [
  {
    id: 'dec-1',
    label: 'Product Name',
    value: 'Organic Whole Wheat Atta',
    confidence: 98,
    status: 'PASS'
  },
  {
    id: 'dec-2',
    label: 'Manufacturer / Packer / Importer',
    value: 'NatureFresh Foods Pvt. Ltd.',
    confidence: 94,
    status: 'PASS'
  },
  {
    id: 'dec-3',
    label: 'Address',
    value: 'Plot 42, Industrial Area Phase 2, New Delhi',
    confidence: 91,
    status: 'FAIL'
  },
  {
    id: 'dec-4',
    label: 'Net Quantity',
    value: '5 kgs.',
    confidence: 96,
    status: 'WARNING'
  },
  {
    id: 'dec-5',
    label: 'MRP',
    value: '₹285.00',
    confidence: 94,
    status: 'FAIL'
  },
  {
    id: 'dec-6',
    label: 'Manufacturing / Packing Date',
    value: '14/01/2026',
    confidence: 97,
    status: 'PASS'
  },
  {
    id: 'dec-7',
    label: 'Consumer Care Details',
    value: 'care@naturefresh.com, 1800-11-9988',
    confidence: 62,
    status: 'FAIL'
  },
  {
    id: 'dec-8',
    label: 'Country of Origin',
    value: 'India',
    confidence: 99,
    status: 'PASS'
  }
];

const INITIAL_VIOLATIONS = [
  {
    id: 'VIO-001',
    name: 'MRP Declaration Non-Compliance',
    explanation: 'MRP numerical value detected without required "Incl. of all taxes" declaration prefix.',
    severity: 'HIGH',
    evidenceRef: 'EV-001',
    reviewStatus: 'CONFIRMED', // CONFIRMED | CLEARED
    remark: ''
  },
  {
    id: 'VIO-002',
    name: 'Font Size Deficit (Consumer Care)',
    explanation: 'Helpline text height (1.1mm) is below the statutory threshold (1.5mm) for 5kg packaging size.',
    severity: 'MEDIUM',
    evidenceRef: 'EV-002',
    reviewStatus: 'CONFIRMED',
    remark: ''
  },
  {
    id: 'VIO-003',
    name: 'Pincode Omission in Address',
    explanation: 'Six-digit pincode omitted from manufacturing address declaration.',
    severity: 'CRITICAL',
    evidenceRef: 'EV-003',
    reviewStatus: 'CONFIRMED',
    remark: ''
  },
  {
    id: 'VIO-004',
    name: 'Non-Standard Net Quantity Unit Symbol',
    explanation: 'Used non-standard abbreviation "kgs." instead of statutory SI unit "kg".',
    severity: 'LOW',
    evidenceRef: 'EV-004',
    reviewStatus: 'CLEARED',
    remark: 'Minor typographic variant allowed per 2024 advisory waiver.'
  }
];

export default function InspectionReviewPage() {
  const { id = 'INSP-2026-0891' } = useParams();
  const navigate = useNavigate();

  // State Management
  const [declarations, setDeclarations] = useState(INITIAL_DECLARATIONS);
  const [editingDecId, setEditingDecId] = useState(null);
  const [tempDecValue, setTempDecValue] = useState('');

  const [violations, setViolations] = useState(INITIAL_VIOLATIONS);
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [finalDecision, setFinalDecision] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Declaration Edit Handlers
  const handleStartEdit = (dec) => {
    setEditingDecId(dec.id);
    setTempDecValue(dec.value);
  };

  const handleSaveEdit = (id) => {
    setDeclarations(prev =>
      prev.map(dec => (dec.id === id ? { ...dec, value: tempDecValue } : dec))
    );
    setEditingDecId(null);
  };

  const handleCancelEdit = () => {
    setEditingDecId(null);
    setTempDecValue('');
  };

  // Violation Status & Remark Handlers
  const handleToggleViolationStatus = (violationId, status) => {
    setViolations(prev =>
      prev.map(v => (v.id === violationId ? { ...v, reviewStatus: status } : v))
    );
  };

  const handleViolationRemarkChange = (violationId, remark) => {
    setViolations(prev =>
      prev.map(v => (v.id === violationId ? { ...v, remark } : v))
    );
  };

  // Review Completion Handler
  const handleCompleteReview = () => {
    if (!finalDecision) {
      setShowErrorAlert(true);
      return;
    }
    setShowErrorAlert(false);
    setIsCompleted(true);
  };

  // Dynamic Summary Metrics
  const passedDeclarations = declarations.filter(d => d.status === 'PASS').length;
  const failedDeclarations = declarations.filter(d => d.status === 'FAIL').length;
  const warningDeclarations = declarations.filter(d => d.status === 'WARNING').length;

  const confirmedViolations = violations.filter(v => v.reviewStatus === 'CONFIRMED').length;
  const clearedViolations = violations.filter(v => v.reviewStatus === 'CLEARED').length;

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/inspection/${id}/evidence`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Evidence
        </button>

        {isCompleted && (
          <button
            onClick={() => navigate(`/inspection/${id}/report`)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all text-sm animate-pulse"
          >
            <span>Generate Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Organic Whole Wheat Atta 5kg</h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${
              isCompleted 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {isCompleted ? 'REVIEW COMPLETED' : 'IN REVIEW'}
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500 mt-2">
            <span>Inspection ID: <strong className="text-slate-700">{id}</strong></span>
            <span>•</span>
            <span>Brand: <strong className="text-slate-700">NatureFresh</strong></span>
            <span>•</span>
            <span>Overall Status: <strong className="text-rose-600 font-semibold">NON-COMPLIANT</strong></span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center gap-3">
          <FileCheck className="w-5 h-5 text-indigo-600" />
          <div className="text-xs">
            <span className="text-slate-500 block">Enforcement Officer</span>
            <span className="font-semibold text-slate-800">Officer R. Sharma (ID: OFF-8821)</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">Manual Review Successfully Submitted</h4>
              <p className="text-xs text-emerald-700">
                All verification edits and officer decisions have been recorded for audit log verification.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/inspection/${id}/report`)}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors shrink-0"
          >
            <span>Proceed to Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Declarations + Violations Review (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Extracted Declarations Review Card */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Extracted Declarations Verification</h3>
                <p className="text-xs text-slate-500">Review and correct OCR-extracted statutory information</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {declarations.length} Mandatory Fields
              </span>
            </div>

            <div className="space-y-3">
              {declarations.map((dec) => {
                const isEditing = editingDecId === dec.id;

                return (
                  <div 
                    key={dec.id} 
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{dec.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          OCR {dec.confidence}%
                        </span>
                        {dec.status === 'PASS' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                          </span>
                        )}
                        {dec.status === 'FAIL' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3 text-rose-600" /> FAIL
                          </span>
                        )}
                        {dec.status === 'WARNING' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> WARNING
                          </span>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={tempDecValue}
                          onChange={(e) => setTempDecValue(e.target.value)}
                          className="flex-1 bg-white border border-indigo-300 rounded px-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                        />
                        <button
                          onClick={() => handleSaveEdit(dec.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded transition-colors"
                          title="Save Changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded transition-colors"
                          title="Cancel"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-semibold text-slate-900">{dec.value}</span>
                        <button
                          onClick={() => handleStartEdit(dec)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Violations Review & Resolution Card */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Violations Confirmation & Adjudication</h3>
                <p className="text-xs text-slate-500">Confirm or clear detected statutory violations and attach officer remarks</p>
              </div>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                {violations.length} Violations
              </span>
            </div>

            <div className="space-y-4">
              {violations.map((vio) => (
                <div 
                  key={vio.id} 
                  className={`p-4 rounded-xl border space-y-3 transition-colors ${
                    vio.reviewStatus === 'CONFIRMED'
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-emerald-200 bg-emerald-50/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{vio.id}</span>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${getSeverityBadgeClass(vio.severity)}`}>
                        {vio.severity}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        Evidence: {vio.evidenceRef}
                      </span>
                    </div>

                    {/* Resolution Action Controls */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                      <button
                        onClick={() => handleToggleViolationStatus(vio.id, 'CONFIRMED')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                          vio.reviewStatus === 'CONFIRMED'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Confirm
                      </button>

                      <button
                        onClick={() => handleToggleViolationStatus(vio.id, 'CLEARED')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                          vio.reviewStatus === 'CLEARED'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clear
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{vio.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{vio.explanation}</p>
                  </div>

                  {/* Inspector Remark per Violation */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <input
                      type="text"
                      placeholder="Add officer remark or justification for override..."
                      value={vio.remark}
                      onChange={(e) => handleViolationRemarkChange(vio.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector Remarks Card */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">General Inspector Remarks</h3>
            </div>
            <textarea
              rows={4}
              value={generalRemarks}
              onChange={(e) => setGeneralRemarks(e.target.value)}
              placeholder="Provide overall summary comments, contextual enforcement notes, or packaging physical sample condition observations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

        </div>

        {/* Right Column: Review Summary & Final Decision (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Review Summary Metrics Card */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Review Summary</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Declarations</span>
                <span className="font-bold text-slate-900">{declarations.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Passed Declarations</span>
                <span className="font-bold text-emerald-700">{passedDeclarations}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Failed Declarations</span>
                <span className="font-bold text-rose-700">{failedDeclarations}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Warnings</span>
                <span className="font-bold text-amber-700">{warningDeclarations}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Confirmed Violations</span>
                <span className="font-bold text-rose-700">{confirmedViolations}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Cleared Violations</span>
                <span className="font-bold text-emerald-700">{clearedViolations}</span>
              </div>
            </div>
          </div>

          {/* Final Decision & Confirmation Panel */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Final Enforcement Decision</h3>
            </div>

            {showErrorAlert && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                Please select a final decision before completing review.
              </div>
            )}

            <div className="space-y-2">
              <label 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  finalDecision === 'COMPLIANT'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="COMPLIANT"
                  checked={finalDecision === 'COMPLIANT'}
                  onChange={(e) => {
                    setFinalDecision(e.target.value);
                    setShowErrorAlert(false);
                  }}
                  className="mt-0.5 text-emerald-600"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Compliant</span>
                  <span className="text-[11px] text-slate-500">Pass packaging label for market release</span>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  finalDecision === 'NON_COMPLIANT'
                    ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="NON_COMPLIANT"
                  checked={finalDecision === 'NON_COMPLIANT'}
                  onChange={(e) => {
                    setFinalDecision(e.target.value);
                    setShowErrorAlert(false);
                  }}
                  className="mt-0.5 text-rose-600"
                />
                <div>
                  <span className="text-xs font-bold text-rose-900 block">Non-Compliant</span>
                  <span className="text-[11px] text-slate-500">Issue formal notice for statutory violations</span>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  finalDecision === 'FURTHER_REVIEW'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="FURTHER_REVIEW"
                  checked={finalDecision === 'FURTHER_REVIEW'}
                  onChange={(e) => {
                    setFinalDecision(e.target.value);
                    setShowErrorAlert(false);
                  }}
                  className="mt-0.5 text-amber-600"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Requires Further Review</span>
                  <span className="text-[11px] text-slate-500">Escalate to Legal Metrology senior controller</span>
                </div>
              </label>
            </div>

            <button
              onClick={handleCompleteReview}
              className={`w-full font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm ${
                isCompleted 
                  ? 'bg-slate-800 text-white hover:bg-slate-900' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              <Check className="w-4 h-4" />
              {isCompleted ? 'Update Final Review' : 'Complete Review'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}