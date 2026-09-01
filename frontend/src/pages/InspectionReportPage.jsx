import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  FileText,
  Home,
  Layers,
  Award,
  ExternalLink
} from 'lucide-react';

const MOCK_REPORT_DATA = {
  reportId: 'REP-2026-9042',
  inspectionId: 'INSP-2026-0891',
  generatedDate: 'September 1, 2026',
  inspectorName: 'Officer R. Sharma (ID: OFF-8821)',
  inspectionLocation: 'Delhi Zonal Enforcement Hub, Okhla District',
  
  product: {
    name: 'Organic Whole Wheat Atta',
    brand: 'NatureFresh',
    category: 'Packaged Food Grains / Legal Metrology Schedule II',
    manufacturer: 'NatureFresh Foods Pvt. Ltd.',
    address: 'Plot 42, Industrial Area Phase 2, New Delhi',
    inspectionDate: 'August 31, 2026',
    netQuantity: '5 kgs.'
  },

  complianceSummary: {
    overallStatus: 'NON-COMPLIANT',
    score: '62.5%',
    totalDeclarations: 8,
    passedDeclarations: 5,
    failedDeclarations: 3,
    warnings: 1,
    totalViolations: 4
  },

  declarations: [
    { declaration: 'Product Name', value: 'Organic Whole Wheat Atta', status: 'PASS', remarks: 'Clear and legible on primary front display panel' },
    { declaration: 'Manufacturer Name & Address', value: 'NatureFresh Foods Pvt. Ltd., New Delhi', status: 'FAIL', remarks: 'Six-digit statutory pincode (110020) omitted' },
    { declaration: 'Net Quantity', value: '5 kgs.', status: 'WARNING', remarks: 'Used non-standard symbol "kgs." instead of SI "kg"' },
    { declaration: 'Maximum Retail Price (MRP)', value: '₹285.00', status: 'FAIL', remarks: 'Missing compulsory prefix "Incl. of all taxes"' },
    { declaration: 'Mfg / Packing Date', value: '14/01/2026', status: 'PASS', remarks: 'Compliant month/year format' },
    { declaration: 'Consumer Care Details', value: 'care@naturefresh.com, 1800-11-9988', status: 'FAIL', remarks: 'Font size 1.1mm below statutory 1.5mm threshold' },
    { declaration: 'Country of Origin', value: 'India', status: 'PASS', remarks: 'Prominently displayed' },
    { declaration: 'Best Before Period', value: '9 Months from packaging', status: 'PASS', remarks: 'Compliant font height and position' }
  ],

  violations: [
    { id: 'VIO-001', name: 'MRP Declaration Non-Compliance', severity: 'HIGH', status: 'CONFIRMED', explanation: 'MRP numerical value detected without compulsory statutory "Incl. of all taxes" declaration prefix.' },
    { id: 'VIO-002', name: 'Font Size Deficit (Consumer Care)', severity: 'MEDIUM', status: 'CONFIRMED', explanation: 'Helpline email text size (1.1mm) is below the required statutory threshold (1.5mm) for 5kg packaging size.' },
    { id: 'VIO-003', name: 'Pincode Omission in Address', severity: 'CRITICAL', status: 'CONFIRMED', explanation: 'Six-digit pincode omitted from primary manufacturing facility listing.' },
    { id: 'VIO-004', name: 'Non-Standard Net Quantity Unit Symbol', severity: 'LOW', status: 'CLEARED', explanation: 'Used abbreviation "kgs." instead of legal SI unit symbol "kg". Overridden with warning by officer.' }
  ],

  evidenceItems: [
    { id: 'EV-001', violationId: 'VIO-001', description: 'MRP numerical zone OCR scan missing tax prefix text', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
    { id: 'EV-002', violationId: 'VIO-002', description: 'Micro-OCR typography measurement showing 1.1mm character height', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
    { id: 'EV-003', violationId: 'VIO-003', description: 'Address panel OCR scan missing 6-digit postal index number', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' }
  ],

  inspectorRemarks: 'Package fails mandatory statutory requirements under Legal Metrology (Packaged Commodities) Rules. Critical omission of pincode in address line and non-compliant font sizes on consumer care helpline. Notice of violation recommended for manufacturer.'
};

export default function InspectionReportPage() {
  const { id = 'INSP-2026-0891' } = useParams();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    triggerToast('PROTOTYPE: Generating and downloading PDF report file (PackSure_INSP-2026-0891.pdf)...');
  };

  const handleExportEditable = () => {
    triggerToast('PROTOTYPE: Exporting raw audit data in XLSX/DOCX format...');
  };

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
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-bounce">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action & Navigation Header (Hidden during native print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/inspection/${id}/review`)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Review
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>

        {/* Report Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            Preview / Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          <button
            onClick={handleExportEditable}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Data
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* SECTION 1: REPORT HEADER */}
        <div className="border-b border-slate-200 pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                PS
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">PackSure SIH Audit Platform</h1>
                <p className="text-xs text-slate-500 font-medium">Statutory Packaging &amp; Legal Metrology Compliance Inspection</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                OFFICIAL AUDIT REPORT
              </span>
              <div className="text-xs text-slate-400 mt-2">Report ID: <strong className="text-slate-700">{MOCK_REPORT_DATA.reportId}</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Inspection Reference</span>
              <strong className="text-slate-800 font-bold">{id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Generation Date</span>
              <strong className="text-slate-800 font-bold">{MOCK_REPORT_DATA.generatedDate}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Enforcement Inspector</span>
              <strong className="text-slate-800 font-bold">{MOCK_REPORT_DATA.inspectorName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Inspection Location</span>
              <strong className="text-slate-800 font-bold">{MOCK_REPORT_DATA.inspectionLocation}</strong>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT INFORMATION & OVERALL COMPLIANCE RESULT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Product Specifications (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Metadata</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Product Name</span>
                <span className="font-bold text-slate-900">{MOCK_REPORT_DATA.product.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Brand</span>
                <span className="font-semibold text-slate-800">{MOCK_REPORT_DATA.product.brand}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-800">{MOCK_REPORT_DATA.product.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Net Quantity</span>
                <span className="font-semibold text-slate-800">{MOCK_REPORT_DATA.product.netQuantity}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Manufacturer / Packer</span>
                <span className="font-semibold text-slate-800">{MOCK_REPORT_DATA.product.manufacturer}</span>
                <span className="text-slate-500 block text-[11px]">{MOCK_REPORT_DATA.product.address}</span>
              </div>
            </div>
          </div>

          {/* Overall Compliance Result Hero (5 Cols) */}
          <div className="lg:col-span-5 bg-rose-50/80 border-2 border-rose-200 p-5 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Audit Result</span>
                <h2 className="text-2xl font-black text-rose-900 mt-0.5 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                  {MOCK_REPORT_DATA.complianceSummary.overallStatus}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-rose-900">{MOCK_REPORT_DATA.complianceSummary.score}</span>
                <span className="text-[10px] text-rose-600 block font-semibold">Compliance Index</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-rose-200/60 text-center">
              <div className="bg-white/80 p-1.5 rounded-lg border border-rose-100">
                <span className="text-[10px] text-slate-500 block">Checked</span>
                <strong className="text-slate-800 text-xs">{MOCK_REPORT_DATA.complianceSummary.totalDeclarations}</strong>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-rose-100">
                <span className="text-[10px] text-emerald-700 block">Passed</span>
                <strong className="text-emerald-700 text-xs">{MOCK_REPORT_DATA.complianceSummary.passedDeclarations}</strong>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-rose-100">
                <span className="text-[10px] text-rose-700 block">Failed</span>
                <strong className="text-rose-700 text-xs">{MOCK_REPORT_DATA.complianceSummary.failedDeclarations}</strong>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-rose-100">
                <span className="text-[10px] text-rose-700 block">Violations</span>
                <strong className="text-rose-700 text-xs">{MOCK_REPORT_DATA.complianceSummary.totalViolations}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 4: STATUTORY DECLARATIONS SUMMARY TABLE */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Statutory Declarations Verification Table</h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Statutory Declaration</th>
                  <th className="p-3">Extracted Value</th>
                  <th className="p-3 w-32">Status</th>
                  <th className="p-3">Verification Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MOCK_REPORT_DATA.declarations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{item.declaration}</td>
                    <td className="p-3 text-slate-700 font-medium">{item.value}</td>
                    <td className="p-3">
                      {item.status === 'PASS' && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                        </span>
                      )}
                      {item.status === 'FAIL' && (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                          <XCircle className="w-3 h-3 text-rose-600" /> FAIL
                        </span>
                      )}
                      {item.status === 'WARNING' && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> WARNING
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 leading-relaxed">{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: DETECTED VIOLATIONS SUMMARY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailed Statutory Violations</h3>
          </div>

          <div className="space-y-2.5">
            {MOCK_REPORT_DATA.violations.map((vio) => (
              <div 
                key={vio.id} 
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  vio.status === 'CONFIRMED'
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{vio.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getSeverityBadgeClass(vio.severity)}`}>
                      {vio.severity}
                    </span>
                    <span className="font-bold text-slate-800">{vio.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    vio.status === 'CONFIRMED' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {vio.status}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed pt-1">{vio.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: EVIDENCE SUMMARY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Audit Evidence Attachments</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_REPORT_DATA.evidenceItems.map((ev) => (
              <div key={ev.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="relative h-28 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={ev.image} alt={ev.id} className="object-cover h-full w-full opacity-90" />
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                    {ev.id}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-indigo-700 font-bold block">Ref: {ev.violationId}</span>
                  <p className="text-slate-600 line-clamp-2 mt-0.5 leading-tight text-[11px]">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: INSPECTOR REMARKS & SIGNATURE BLOCK */}
        <div className="border-t border-slate-200 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Reviewer Verdict &amp; Remarks</span>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{MOCK_REPORT_DATA.inspectorRemarks}"
            </p>
          </div>

          <div className="lg:col-span-4 border border-slate-200 p-4 rounded-xl flex flex-col justify-between text-center space-y-4">
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">Digital Verification Stamp</span>
              <span className="font-bold text-indigo-900 text-xs">Legal Metrology Enforcement Directorate</span>
            </div>
            
            <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
              OFF-8821 / DIGITALLY SIGNED
            </div>

            <div className="text-[10px] text-slate-400">
              Generated automatically via PackSure SIH Platform
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}