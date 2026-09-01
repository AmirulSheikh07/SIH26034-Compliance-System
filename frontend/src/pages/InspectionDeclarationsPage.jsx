import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Info
} from 'lucide-react';

const INITIAL_DECLARATIONS = [
  {
    id: 'dec_1',
    name: 'Manufacturer / Packer / Importer',
    extractedValue: 'NatureFresh Foods Pvt. Ltd.',
    status: 'PASS',
    confidence: 95,
    explanation: 'Manufacturer identity clearly stated as per Rule 6(1)(a).'
  },
  {
    id: 'dec_2',
    name: 'Complete Address',
    extractedValue: 'Plot 42, Industrial Area, Phase II, New Delhi - 110020',
    status: 'PASS',
    confidence: 91,
    explanation: 'Full address with postal pincode provided.'
  },
  {
    id: 'dec_3',
    name: 'Common / Generic Name of Commodity',
    extractedValue: 'Organic Whole Wheat Atta',
    status: 'PASS',
    confidence: 98,
    explanation: 'Commodity name is clearly legible and unambiguous.'
  },
  {
    id: 'dec_4',
    name: 'Net Quantity',
    extractedValue: '5 kg',
    status: 'PASS',
    confidence: 96,
    explanation: 'Standard units used matching prescribed dimensions.'
  },
  {
    id: 'dec_5',
    name: 'Maximum Retail Price (MRP)',
    extractedValue: '325.00',
    status: 'FAIL',
    confidence: 94,
    explanation: 'Missing mandatory prefix "Incl. of all taxes" as required by Rule 6(1)(e).'
  },
  {
    id: 'dec_6',
    name: 'Mfg / Packing / Import Date',
    extractedValue: '08/2026',
    status: 'PASS',
    confidence: 89,
    explanation: 'Month and year of packing clearly printed.'
  },
  {
    id: 'dec_7',
    name: 'Consumer Care Details',
    extractedValue: '1800-11-2233 / care@naturefresh.com',
    status: 'WARNING',
    confidence: 62,
    explanation: 'Low OCR confidence on contact email; physical helpline address font size questionable.'
  },
  {
    id: 'dec_8',
    name: 'Country of Origin',
    extractedValue: 'India',
    status: 'PASS',
    confidence: 99,
    explanation: 'Explicitly declared on main display panel.'
  }
];

export default function InspectionDeclarationsPage() {
  const { id = 'INSP-2026-0891' } = useParams();
  const navigate = useNavigate();

  const [declarations, setDeclarations] = useState(INITIAL_DECLARATIONS);
  const [editingId, setEditingId] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Calculate summary stats
  const passCount = declarations.filter(d => d.status === 'PASS').length;
  const failCount = declarations.filter(d => d.status === 'FAIL').length;
  const warningCount = declarations.filter(d => d.status === 'WARNING').length;

  const overallStatus = failCount > 0 ? 'NON-COMPLIANT' : warningCount > 0 ? 'NEEDS REVIEW' : 'COMPLIANT';

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTempValue(item.extractedValue);
  };

  const handleSave = (id) => {
    setDeclarations(prev =>
      prev.map(item => item.id === id ? { ...item, extractedValue: tempValue } : item)
    );
    setEditingId(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempValue('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Navigation Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/inspection/${id}/analysis`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis / OCR
        </button>

        <button
          onClick={() => navigate(`/inspection/${id}/violations`)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all text-sm"
        >
          <span>View Violations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Inspection Header Banner */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Organic Whole Wheat Atta 5kg</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${
                overallStatus === 'NON-COMPLIANT'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : overallStatus === 'NEEDS REVIEW'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {overallStatus === 'NON-COMPLIANT' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : overallStatus === 'NEEDS REVIEW' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {overallStatus}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Inspection ID: <strong className="text-slate-700">{id}</strong> • Mandatory Legal Metrology Audit
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-medium text-slate-600">Legal Metrology Act, 2009 Compliant Verification</span>
          </div>
        </div>

        {/* Audit Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total Checked</span>
            <span className="text-xl font-bold text-slate-900">{declarations.length}</span>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-100 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-800">Passed</span>
            <span className="text-xl font-bold text-emerald-700">{passCount}</span>
          </div>
          <div className="bg-rose-50/60 p-4 rounded-lg border border-rose-100 flex items-center justify-between">
            <span className="text-sm font-medium text-rose-800">Failed</span>
            <span className="text-xl font-bold text-rose-700">{failCount}</span>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-lg border border-amber-100 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">Warnings</span>
            <span className="text-xl font-bold text-amber-700">{warningCount}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Declarations Table Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Extracted Declarations</h2>
          </div>
          <span className="text-xs text-slate-500">
            Double-check values extracted by OCR and correct manually if needed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Declaration Field</th>
                <th className="py-3.5 px-4">Extracted Value</th>
                <th className="py-3.5 px-4 text-center">Confidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Legal Compliance Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {declarations.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Declaration Name */}
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>

                    {/* Extracted Value (or Edit Input) */}
                    <td className="py-4 px-4 max-w-xs">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-full text-sm p-1.5 border border-indigo-400 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-slate-700 break-words">
                          {item.extractedValue}
                        </span>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.confidence < 75 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.confidence}%
                      </span>
                    </td>

                    {/* Compliance Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.status === 'PASS' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          PASS
                        </span>
                      )}
                      {item.status === 'FAIL' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          FAIL
                        </span>
                      )}
                      {item.status === 'WARNING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          WARNING
                        </span>
                      )}
                    </td>

                    {/* Explanation / Notes */}
                    <td className="py-4 px-4 text-xs text-slate-600 max-w-md leading-relaxed">
                      {item.explanation}
                    </td>

                    {/* Action Controls */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSave(item.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
                            title="Cancel edit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Updates saved locally for inspector session state</span>
        </div>
        <button
          onClick={() => navigate(`/inspection/${id}/violations`)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-xs transition-all text-sm"
        >
          <span>View Violations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}