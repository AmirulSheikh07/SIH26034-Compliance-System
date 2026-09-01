import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspectionById } from '../../shared/services/inspectionService';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Scale, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Sliders,
  AlertCircle
} from 'lucide-react';

const InspectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data States
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScanDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getInspectionById(id);
        setScan(data);
      } catch (err) {
        setError(err.message || 'Inspection record not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchScanDetails();
  }, [id]);

  const formatStatus = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  };

  const getConfidenceBadgeColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 max-w-md mx-auto mt-12">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={() => navigate('/inspections')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded text-sm font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
        >
          Back to History
        </button>
      </div>
    );
  }

  const isCompliant = scan.compliance_status === 'COMPLIANT';
  const isWarning = scan.compliance_status === 'WARNING';

  return (
    <div className="space-y-6 antialiased text-slate-800">
      
      {/* Header back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/inspections')}
          className="rounded border border-slate-255 bg-white p-1.5 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Audit File</h2>
          <p className="text-xs text-slate-500 font-medium">Record Reference ID: {scan.id}</p>
        </div>
      </div>

      {/* Main Grid: Overview Columns & Analysis Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Audit specs */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Audit Specifications
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Audit Rating</span>
                <span 
                  className={`mt-1 inline-flex items-center gap-1 rounded border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isCompliant
                      ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                      : isWarning
                      ? 'border-amber-250 bg-amber-50 text-amber-700'
                      : 'border-rose-250 bg-rose-50 text-rose-700'
                  }`}
                >
                  {scan.compliance_status === 'COMPLIANT' && <CheckCircle className="h-3.5 w-3.5 shrink-0" />}
                  {scan.compliance_status !== 'COMPLIANT' && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                  {formatStatus(scan.compliance_status)}
                </span>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Date Inspected</span>
                  <span className="text-xs font-bold text-slate-755">
                    {new Date(scan.scan_date).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                <User className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Officer</span>
                  <span className="text-xs font-bold text-slate-755">{scan.inspector_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Store Location</span>
                  <span className="text-xs font-bold text-slate-755">{scan.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                <Sliders className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">AI OCR Confidence</span>
                  <span className="text-xs font-bold text-slate-755">{(scan.ocr_confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Product Specifications
            </h3>
            
            <div>
              <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Product Name</span>
              <span className="text-xs font-bold text-slate-800">{scan.product_name}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Brand</span>
              <span className="text-xs font-bold text-slate-800">{scan.brand}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">GTIN Barcode</span>
              <span className="text-xs font-mono text-slate-750">{scan.product_barcode}</span>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Manufacturer</span>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{scan.extracted_data.manufacturer}</p>
            </div>
          </div>

          {/* The Integration Bridge Links */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Compliance Checks
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => navigate(`/inspection/${scan.id}/analysis`)}
                className="w-full text-center rounded border border-slate-200 py-1.5 text-xs font-semibold text-slate-750 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                View OCR Layout Analysis
              </button>
              <button 
                onClick={() => navigate(`/inspection/${scan.id}/evidence`)}
                className="w-full text-center rounded border border-slate-200 py-1.5 text-xs font-semibold text-slate-755 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                View Image Evidence Bounding Boxes
              </button>
              <button 
                onClick={() => navigate(`/inspection/${scan.id}/review`)}
                className="w-full text-center rounded border border-slate-250 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50/30 transition-colors cursor-pointer"
              >
                Perform Manual Overrides / Review
              </button>
              <button 
                onClick={() => navigate(`/inspection/${scan.id}/report`)}
                className="w-full text-center rounded bg-slate-800 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Review Digital Seizure Memo
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Extracted Declarations check details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Extracted Legal Declarations Checks
            </h3>

            <div className="space-y-4">
              {scan.checks.map((check) => {
                const isCheckPassed = check.status === 'PASS';
                
                return (
                  <div 
                    key={check.field} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-200/60 rounded-lg p-4 bg-slate-50/30 hover:bg-slate-50/70 transition-colors gap-3"
                  >
                    {/* Left: Field Name and value */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {check.field.replace('_', ' ')}
                      </span>
                      <p className="text-sm font-bold text-slate-850">
                        {scan.extracted_data[check.field] || 'Not Detected'}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {check.message}
                      </p>
                    </div>

                    {/* Right: Status and confidence level */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      
                      {/* Check Rating Badge */}
                      <span 
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isCheckPassed
                            ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                            : 'border-rose-250 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isCheckPassed ? 'Compliant' : 'Violation'}
                      </span>

                      {/* Confidence Score tag */}
                      <span 
                        className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getConfidenceBadgeColor(check.confidence_level)}`}
                      >
                        OCR Confidence: {check.confidence_level} ({(check.confidence * 100).toFixed(0)}%)
                      </span>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default InspectionDetails;
