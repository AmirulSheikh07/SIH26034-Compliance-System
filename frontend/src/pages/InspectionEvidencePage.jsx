import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  ShieldAlert, 
  FileCheck, 
  Type, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Layers,
  Info,
  Sliders
} from 'lucide-react';

const MOCK_EVIDENCE_ITEMS = [
  {
    id: 'EV-001',
    violationId: 'VIO-001',
    field: 'Maximum Retail Price (MRP)',
    severity: 'HIGH',
    confidence: 94,
    description: 'MRP numerical value detected without "Incl. of all taxes" declaration prefix.',
    // Normalized percentages for bounding box position on image container
    box: { top: 62, left: 18, width: 34, height: 14 },
    typography: {
      detectedHeight: '2.8 mm',
      requiredHeight: '3.0 mm',
      status: 'FAIL',
      readability: '92% Clear'
    }
  },
  {
    id: 'EV-002',
    violationId: 'VIO-002',
    field: 'Consumer Care Details',
    severity: 'MEDIUM',
    confidence: 62,
    description: 'Helpline email text size below statutory threshold for 5kg packaging size.',
    box: { top: 78, left: 54, width: 38, height: 16 },
    typography: {
      detectedHeight: '1.1 mm',
      requiredHeight: '1.5 mm',
      status: 'FAIL',
      readability: '68% Low Contrast'
    }
  },
  {
    id: 'EV-003',
    violationId: 'VIO-003',
    field: 'Manufacturer / Packer Address',
    severity: 'CRITICAL',
    confidence: 91,
    description: 'Pincode (110020) omitted from primary manufacturing facility listing.',
    box: { top: 22, left: 12, width: 44, height: 28 },
    typography: {
      detectedHeight: '2.0 mm',
      requiredHeight: '2.0 mm',
      status: 'PASS',
      readability: '95% Clear'
    }
  },
  {
    id: 'EV-004',
    violationId: 'VIO-004',
    field: 'Net Quantity',
    severity: 'LOW',
    confidence: 96,
    description: 'Non-standard symbol representation ("5 kgs.") instead of legal SI unit symbol "5 kg".',
    box: { top: 48, left: 60, width: 28, height: 18 },
    typography: {
      detectedHeight: '4.2 mm',
      requiredHeight: '4.0 mm',
      status: 'PASS',
      readability: '99% Crisp'
    }
  }
];

const MOCK_IMAGE_METADATA = {
  type: 'Back Display Panel Label',
  qualityScore: '94% (High Clarity)',
  resolution: '2400 x 1800 px (300 DPI)',
  ocrStatus: 'Completed (8/8 Bounding Boxes Extracted)'
};

export default function InspectionEvidencePage() {
  const { id = 'INSP-2026-0891' } = useParams();
  const navigate = useNavigate();

  const [selectedEvidenceId, setSelectedEvidenceId] = useState('EV-001');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  const selectedItem = MOCK_EVIDENCE_ITEMS.find(item => item.id === selectedEvidenceId) || MOCK_EVIDENCE_ITEMS[0];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

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
      {/* Navigation Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/inspection/${id}/violations`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Violations
        </button>

        <button
          onClick={() => navigate(`/inspection/${id}/review`)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-xs hover:shadow-sm transition-all text-sm"
        >
          <span>Proceed to Manual Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Overview Header */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Organic Whole Wheat Atta 5kg</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              NON-COMPLIANT AUDIT
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500 mt-2">
            <span>Inspection ID: <strong className="text-slate-700">{id}</strong></span>
            <span>•</span>
            <span>Brand: <strong className="text-slate-700">NatureFresh</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-3 rounded-xl">
          <Layers className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <div className="text-xs text-indigo-700 font-medium">Evidence Zones Detected</div>
            <div className="text-xl font-bold text-indigo-950">{MOCK_EVIDENCE_ITEMS.length} Visual Bounding Zones</div>
          </div>
        </div>
      </div>

      {/* Main Evidence Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Viewer + Typography Metrics (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Packaging Image Viewer Card */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
            
            {/* Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-800">Spatial Bounding Box Overlay</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-medium border transition-colors flex items-center gap-1.5 ${
                    showBoundingBoxes
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showBoundingBoxes ? 'Bounding Boxes Visible' : 'Hide Overlay'}
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="text-xs font-semibold text-slate-600 w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>

                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Canvas Container */}
            <div className="relative w-full h-[460px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              <div 
                className="relative transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Product Packaging Image */}
                <img
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=1000"
                  alt="Packaging Label Evidence"
                  className="max-h-[440px] w-auto object-contain select-none"
                />

                {/* Render Bounding Box Overlays */}
                {showBoundingBoxes && MOCK_EVIDENCE_ITEMS.map((item) => {
                  const isSelected = item.id === selectedEvidenceId;
                  const isCritical = item.severity === 'CRITICAL' || item.severity === 'HIGH';

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedEvidenceId(item.id)}
                      style={{
                        top: `${item.box.top}%`,
                        left: `${item.box.left}%`,
                        width: `${item.box.width}%`,
                        height: `${item.box.height}%`,
                      }}
                      className={`absolute rounded transition-all flex items-start justify-between p-1 cursor-pointer border-2 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500/25 ring-4 ring-indigo-500/30 z-20' 
                          : isCritical
                          ? 'border-rose-500 bg-rose-500/15 hover:bg-rose-500/30 z-10'
                          : 'border-amber-400 bg-amber-400/15 hover:bg-amber-400/30 z-10'
                      }`}
                    >
                      <span className={`text-[10px] font-bold px-1 rounded text-white ${
                        isSelected ? 'bg-indigo-600' : isCritical ? 'bg-rose-600' : 'bg-amber-600'
                      }`}>
                        {item.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Click any highlighted bounding zone on the label image to select an evidence item.</span>
              <span>Selected: <strong className="text-indigo-600">{selectedEvidenceId}</strong></span>
            </div>
          </div>

          {/* Detailed Typography & Readability Analysis Card */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Type className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Font & Readability Analysis — <span className="text-indigo-600">{selectedItem.field}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Detected Font Size</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{selectedItem.typography.detectedHeight}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Required Minimum</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{selectedItem.typography.requiredHeight}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Text Clarity Score</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{selectedItem.typography.readability}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Height Compliance</span>
                <div className="mt-1">
                  {selectedItem.typography.status === 'PASS' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      COMPLIANT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      NON-COMPLIANT
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              <strong className="text-slate-700">Legal Metrology Note: </strong>
              Font character height is measured according to specified display area surface size. Package volume &gt; 4kg requires minimum statutory height of 3.0mm for critical numbers and 1.5mm for consumer address details.
            </p>
          </div>
        </div>

        {/* Right Column: Evidence List + Image Metadata (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Evidence Items Selector List */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Evidence Records</h3>
              <span className="text-xs font-medium text-slate-400">{MOCK_EVIDENCE_ITEMS.length} Total</span>
            </div>

            <div className="space-y-3">
              {MOCK_EVIDENCE_ITEMS.map((item) => {
                const isSelected = item.id === selectedEvidenceId;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvidenceId(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{item.field}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
                      <span className="text-slate-400">Violation: <strong className="text-slate-600">{item.violationId}</strong></span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        OCR {item.confidence}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image & Capture Metadata Card */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-900 text-sm">Image Technical Metadata</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Panel Type</span>
                <span className="font-semibold text-slate-800">{MOCK_IMAGE_METADATA.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Quality Score</span>
                <span className="font-semibold text-emerald-700">{MOCK_IMAGE_METADATA.qualityScore}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Resolution</span>
                <span className="font-semibold text-slate-800">{MOCK_IMAGE_METADATA.resolution}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">OCR Status</span>
                <span className="font-semibold text-indigo-700">{MOCK_IMAGE_METADATA.ocrStatus}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}