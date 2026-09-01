import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Eye,
  X,
  FileSearch,
  AlertCircle,
  Info
} from 'lucide-react';

export default function InspectionViolationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State passed from InspectionAnalysisPage or InspectionDeclarationsPage
  const scanResult      = location.state?.scanResult      ?? null;
  const imagePreviewUrl = location.state?.imagePreviewUrl ?? null;

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Use real violations from scanResult
  const violations = scanResult?.violations ?? [];

  // Filter Logic
  const filteredViolations = violations.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.rule_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
      case 'HIGH': return 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
      case 'MEDIUM': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'LOW': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Shared navigation state
  const navState = { state: { scanResult, imagePreviewUrl } };

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
      {/* Navigation Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/inspection/${id}/declarations`, navState)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Declarations
        </button>

        <button
          onClick={() => navigate(`/inspection/${id}/evidence`, navState)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all text-sm"
        >
          <span>View Evidence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Violations Detected</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              {violations.length > 0 ? 'NON-COMPLIANT' : 'COMPLIANT'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scan ID:&nbsp;<strong className="text-slate-700 dark:text-slate-300">#{id}</strong>
            &nbsp;·&nbsp;File:&nbsp;
            <strong className="text-slate-700 dark:text-slate-300">{scanResult.filename ?? '—'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 px-5 py-3 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-500 shrink-0" />
          <div>
            <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Total Violations</div>
            <div className="text-xl font-bold text-rose-900 dark:text-rose-300">{violations.length} Issues Found</div>
          </div>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search violations, fields, or rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800">
            {violations.length === 0 ? (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Perfect compliance score!</h3>
                <p className="text-sm text-slate-500 mt-1">No legal metrology violations were detected in this scan.</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No violations match filters</h3>
                <p className="text-sm text-slate-500 mt-1">Try clearing your search term or adjusting selected criteria.</p>
              </>
            )}
          </div>
        ) : (
          filteredViolations.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getSeverityBadgeClass(item.severity)}`}>
                    {item.severity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Rule ID: {item.rule_id || 'UNKNOWN'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title || `Missing ${item.field} Declaration`}</h3>

                <div className="grid grid-cols-1 gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <div><strong>Affected Field:</strong> <span className="font-medium text-slate-800 dark:text-slate-300">{item.field}</span></div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-rose-50/50 dark:bg-rose-950/10 p-2 rounded border border-rose-100/50 dark:border-rose-900/30">
                  {item.message}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end border-t border-slate-100 dark:border-slate-800 md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => setSelectedViolation(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Violation Details Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getSeverityBadgeClass(selectedViolation.severity)}`}>
                    {selectedViolation.severity} SEVERITY
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Rule ID: {selectedViolation.rule_id || 'UNKNOWN'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedViolation.title || `Missing ${selectedViolation.field} Declaration`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedViolation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target Field</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedViolation.field}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Non-Compliance Explanation</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/40 text-xs">
                  {selectedViolation.message}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedViolation(null);
                  navigate(`/inspection/${id}/evidence`, navState);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <FileSearch className="w-3.5 h-3.5" />
                Inspect Evidence Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
