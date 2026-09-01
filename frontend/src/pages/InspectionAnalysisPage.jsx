import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  RefreshCw, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const MOCK_INSPECTION_DATA = {
  id: 'INSP-2026-0891',
  productName: 'Organic Whole Wheat Atta 5kg',
  brand: 'NatureFresh',
  imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
  ocrResults: [
    { field: 'Product Name', value: 'Organic Whole Wheat Atta', confidence: 98, status: 'success' },
    { field: 'Manufacturer / Packer', value: 'NatureFresh Foods Pvt. Ltd.', confidence: 95, status: 'success' },
    { field: 'Address', value: 'Plot 42, Industrial Area, Phase II, New Delhi - 110020', confidence: 91, status: 'success' },
    { field: 'Net Quantity', value: '5 kg', confidence: 96, status: 'success' },
    { field: 'MRP (Incl. of all taxes)', value: '₹ 325.00', confidence: 94, status: 'success' },
    { field: 'Mfg / Packing Date', value: '08/2026', confidence: 89, status: 'success' },
    { field: 'Consumer Care Details', value: '1800-11-2233 / care@naturefresh.com', confidence: 62, status: 'warning', note: 'Low confidence on email character resolution' },
    { field: 'Country of Origin', value: 'India', confidence: 99, status: 'success' },
  ]
};

const SCAN_STEPS = [
  { id: 1, label: 'Image uploaded' },
  { id: 2, label: 'OCR processing' },
  { id: 3, label: 'Declaration extraction' },
  { id: 4, label: 'Compliance analysis' }
];

export default function InspectionAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedImage = location.state?.uploadedImage;
  const displayImage = passedImage || MOCK_INSPECTION_DATA.imageUrl;

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 1000);
    const timer2 = setTimeout(() => setCurrentStep(3), 2200);
    const timer3 = setTimeout(() => {
      setCurrentStep(4);
      setIsProcessing(false);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {location.state?.productName || MOCK_INSPECTION_DATA.productName}
            </h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
              isProcessing 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Analysis Complete
                </>
              )}
            </span>
          </div>
          <div className="flex gap-4 text-sm text-slate-500 mt-2">
            <span>Inspection ID: <strong className="text-slate-700">{id || MOCK_INSPECTION_DATA.id}</strong></span>
            <span>•</span>
            <span>Brand: <strong className="text-slate-700">{location.state?.brand || MOCK_INSPECTION_DATA.brand}</strong></span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/inspection/${id || MOCK_INSPECTION_DATA.id}/declarations`)}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
            isProcessing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
          }`}
        >
          <span>Review Declarations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Scanning Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SCAN_STEPS.map((step) => {
            const isDone = currentStep > step.id || (!isProcessing && currentStep === 4);
            const isCurrent = currentStep === step.id && isProcessing;

            return (
              <div 
                key={step.id} 
                className={`p-4 rounded-lg border flex items-center gap-3 transition-all ${
                  isDone 
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                    : isCurrent 
                      ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-300 shrink-0" />
                )}
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Viewer */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Uploaded Package Label
            </h3>
            {isProcessing && (
              <span className="text-xs font-medium text-indigo-600 animate-pulse flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Scanning label...
              </span>
            )}
          </div>
          
          <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-square flex items-center justify-center border border-slate-200">
            <img 
              src={displayImage} 
              alt="Uploaded Product Packaging" 
              className="object-contain w-full h-full"
            />
            
            {/* Visual Scanning Effect Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none">
                <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[bounce_2s_infinite]" />
              </div>
            )}
          </div>
        </div>

        {/* Right: OCR Extraction Data */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Legal Metrology Declarations (OCR)</h3>
              <span className="text-xs text-slate-500">Auto-extracted</span>
            </div>

            <div className="divide-y divide-slate-100">
              {MOCK_INSPECTION_DATA.ocrResults.map((item, index) => {
                const isUncertain = item.status === 'warning';

                return (
                  <div key={index} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium">{item.field}</div>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-2">
                        {item.value}
                        {isUncertain && (
                          <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                            Needs review
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <div className="text-xs text-amber-600 mt-0.5">{item.note}</div>
                      )}
                    </div>

                    {/* Confidence Score Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full ${isUncertain ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        isUncertain 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => navigate(`/inspection/${id || MOCK_INSPECTION_DATA.id}/declarations`)}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                isProcessing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
              }`}
            >
              <span>Review Declarations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}