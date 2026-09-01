import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Filter, 
  Eye, 
  X, 
  CheckCircle2, 
  FileSearch,
  AlertCircle
} from 'lucide-react';

const MOCK_VIOLATIONS = [
  {
    id: 'VIO-001',
    title: 'MRP Missing Required Tax Inclusion Prefix',
    field: 'Maximum Retail Price (MRP)',
    extractedValue: '₹ 325.00',
    expectedCondition: 'Must include phrase "Incl. of all taxes" per Rule 6(1)(e)',
    explanation: 'The MRP numerical value is present, but the legally mandated statutory phrase "Incl. of all taxes" is absent from the primary panel display.',
    severity: 'HIGH',
    status: 'OPEN',
    evidenceRef: 'EVID-MRP-01 (Bounding Box #4)'
  },
  {
    id: 'VIO-002',
    title: 'Consumer Care Contact Font Height Deficit',
    field: 'Consumer Care Details',
    extractedValue: '1800-11-2233 / care@naturefresh.com',
    expectedCondition: 'Minimum character height must be ≥ 1.5mm for 5kg packaging',
    explanation: 'OCR character height analysis indicates the email address font size measured at 1.1mm, falling short of Legal Metrology packaged commodity standards.',
    severity: 'MEDIUM',
    status: 'OPEN',
    evidenceRef: 'EVID-CC-02 (Bounding Box #7)'
  },
  {
    id: 'VIO-003',
    title: 'Incomplete Importer Premises Identification',
    field: 'Manufacturer / Packer / Importer',
    extractedValue: 'NatureFresh Foods, Phase II',
    expectedCondition: 'Full street, plot, and postal pincode address must be disclosed',
    explanation: 'Sub-panel address fails to include the pincode (110020) and full industrial estate registration details.',
    severity: 'CRITICAL',
    status: 'REVIEWED',
    evidenceRef: 'EVID-ADDR-03 (Bounding Box #2)'
  },
  {
    id: 'VIO-004',
    title: 'Net Quantity Symbol Standard Non-Conformance',
    field: 'Net Quantity',
    extractedValue: '5 kgs.',
    expectedCondition: 'Standard symbol for kilogram is "kg" without trailing full stop',
    explanation: 'Rule 13 mandates SI unit symbols. The plural suffix "s." is an improper unit representation.',
    severity: 'LOW',
    status: 'RESOLVED',
    evidenceRef: 'EVID-QTY-04 (Bounding Box #1)'
  }
];

export default function InspectionViolationsPage() {
  const { id = 'INSP-2026-0891' } = useParams();
  const navigate = useNavigate();

  const [violations, setViolations] = useState(MOCK_VIOLATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Filter Logic
  const filteredViolations = violations.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REVIEWED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Navigation Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/inspection/${id}/declarations`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Declarations
        </button>

        <button
          onClick={() => navigate(`/inspection/${id}/evidence`)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all text-sm"
        >
          <span>View Evidence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Organic Whole Wheat Atta 5kg</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              NON-COMPLIANT
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500 mt-2">
            <span>Inspection ID: <strong className="text-slate-700">{id}</strong></span>
            <span>•</span>
            <span>Brand: <strong className="text-slate-700">NatureFresh</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 px-5 py-3 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <div className="text-xs text-rose-600 font-medium">Total Violations Detected</div>
            <div className="text-xl font-bold text-rose-900">{violations.length} Non-Compliances</div>
          </div>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search violations or fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg p-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No violations match filters</h3>
            <p className="text-sm text-slate-500 mt-1">Try clearing your search term or adjusting selected criteria.</p>
          </div>
        ) : (
          filteredViolations.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getSeverityBadgeClass(item.severity)}`}>
                    {item.severity}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-medium text-slate-400">ID: {item.id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                  <div><strong>Field:</strong> {item.field}</div>
                  <div><strong>Extracted:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-700">{item.extractedValue}</code></div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{item.explanation}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => setSelectedViolation(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Violation Details Drawer Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getSeverityBadgeClass(selectedViolation.severity)}`}>
                    {selectedViolation.severity} SEVERITY
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getStatusBadgeClass(selectedViolation.status)}`}>
                    {selectedViolation.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedViolation.title}</h3>
              </div>
              <button
                onClick={() => setSelectedViolation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">Target Field</span>
                <p className="font-semibold text-slate-800">{selectedViolation.field}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-xs font-medium text-slate-500">Extracted Value</span>
                  <p className="text-sm font-bold text-rose-600 mt-0.5">{selectedViolation.extractedValue}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Required Condition</span>
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5">{selectedViolation.expectedCondition}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">Non-Compliance Explanation</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-xs">
                  {selectedViolation.explanation}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Evidence Ref: <strong className="text-slate-700">{selectedViolation.evidenceRef}</strong></span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedViolation(null);
                  navigate(`/inspection/${id}/evidence`);
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