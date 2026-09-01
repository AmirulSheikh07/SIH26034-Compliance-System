import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductByBarcode, getProductInspections } from '../../shared/services/productService';
import { ArrowLeft, Calendar, FileText, MapPin, Scale, ShieldAlert, ShieldCheck } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams(); // 'id' contains the barcode string from route path
  const navigate = useNavigate();

  // Data States
  const [product, setProduct] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const productInfo = await getProductByBarcode(id);
        const productHistory = await getProductInspections(id);
        
        setProduct(productInfo);
        setInspections(productHistory);
      } catch (err) {
        setError(err.message || 'Failed to fetch product records.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Helper to format status names
  const formatStatus = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
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
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        <ShieldAlert className="mx-auto h-8 w-8 mb-2" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded text-sm font-semibold hover:bg-slate-900 transition-colors"
        >
          Back to Repository
        </button>
      </div>
    );
  }

  // Derive the latest compliance status based on the newest scan, or default to Compliant
  const currentStatus = inspections.length > 0 ? inspections[0].compliance_status : 'COMPLIANT';

  return (
    <div className="space-y-6 antialiased text-slate-800">
      
      {/* Back button & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/products')}
          className="rounded border border-slate-255 bg-white p-1.5 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product File</h2>
          <p className="text-xs text-slate-500 font-medium">GTIN Barcode: {product.barcode}</p>
        </div>
      </div>

      {/* Main Grid: Info card and Audit History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: General Product Specs Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            {/* Product Image preview */}
            <div className="h-48 bg-slate-100 flex items-center justify-center border-b border-slate-100">
              <img
                src={product.imageUrl}
                alt={product.product_name}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Specs Detail */}
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{product.product_name}</h3>
                <p className="text-xs text-slate-500 font-medium">{product.brand}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Badge</span>
                <span 
                  className={`mt-1 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    currentStatus === 'COMPLIANT'
                      ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                      : currentStatus === 'NON_COMPLIANT'
                      ? 'border-rose-250 bg-rose-50 text-rose-700'
                      : 'border-amber-250 bg-amber-50 text-amber-700'
                  }`}
                >
                  {currentStatus === 'COMPLIANT' ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <ShieldAlert className="h-3 w-3" />
                  )}
                  {formatStatus(currentStatus)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                <span className="text-xs font-semibold text-slate-700 mt-1 block">{product.category}</span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Manufacturer / Packer</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{product.manufacturer}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-medium space-y-1">
                <p>First Inspected: {new Date(product.created_at).toLocaleDateString('en-IN')}</p>
                <p>Total Inspection Events: {inspections.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Inspection Events Timeline & Violations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Inspections Timeline
            </h3>

            {inspections.length === 0 ? (
              <p className="py-12 text-center text-xs text-slate-400">No inspections logged for this product.</p>
            ) : (
              <div className="relative border-l border-slate-200 ml-3.5 space-y-8 py-2">
                {inspections.map((event) => {
                  const isCompliant = event.compliance_status === 'COMPLIANT';
                  const isWarning = event.compliance_status === 'WARNING';
                  
                  return (
                    <div key={event.id} className="relative pl-6">
                      
                      {/* Timeline Dot Indicator */}
                      <span 
                        className={`absolute -left-2 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-white ${
                          isCompliant
                            ? 'border-emerald-500 text-emerald-500'
                            : isWarning
                            ? 'border-amber-500 text-amber-500'
                            : 'border-rose-500 text-rose-500'
                        }`}
                      >
                        <span 
                          className={`h-2 w-2 rounded-full ${
                            isCompliant
                              ? 'bg-emerald-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`} 
                        />
                      </span>

                      {/* Event details */}
                      <div className="space-y-3 bg-slate-50/50 border border-slate-200/50 rounded-lg p-4">
                        
                        {/* Event Title Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-200/40 pb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{event.id}</span>
                            <span 
                              className={`ml-2.5 inline-flex items-center rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                isCompliant
                                  ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                                  : isWarning
                                  ? 'border-amber-250 bg-amber-50 text-amber-700'
                                  : 'border-rose-250 bg-rose-50 text-rose-700'
                              }`}
                            >
                              {formatStatus(event.compliance_status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(event.scan_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Inspector, Location details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Scale className="h-4 w-4 text-slate-400" />
                            <span>Inspector: {event.inspector_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>Location: {event.location}</span>
                          </div>
                        </div>

                        {/* Bounding box / ocr validation detail */}
                        {event.violations.length > 0 && (
                          <div className="border-t border-slate-200/45 pt-3">
                            <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2">
                              Recorded Violations
                            </h4>
                            <ul className="space-y-2">
                              {event.violations.map((v) => (
                                <li 
                                  key={v.id} 
                                  className="text-xs bg-rose-50/30 border border-rose-200/45 rounded p-2.5 text-slate-650"
                                >
                                  <div className="flex items-center justify-between border-b border-rose-100/50 pb-1 mb-1 font-semibold text-rose-850">
                                    <span>{v.violation}</span>
                                    <span className="text-[9px] uppercase font-bold text-rose-700">{v.rule_id}</span>
                                  </div>
                                  <p className="leading-relaxed text-[11px] text-slate-500">{v.evidence}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 pt-1.5">
                          <button
                            onClick={() => navigate(`/inspections/${event.id}`)}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer text-slate-700"
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            View Audit Details
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
