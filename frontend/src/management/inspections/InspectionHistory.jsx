import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInspections } from '../../shared/services/inspectionService';
import { Search, Filter, RotateCcw, Eye, FileText, Calendar, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const InspectionHistory = () => {
  const navigate = useNavigate();

  // Data States
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Sort States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [sortField, setSortField] = useState('scan_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadInspections = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInspections({ search, status, location });
      
      const sortedData = [...data].sort((a, b) => {
        let fieldA = a[sortField] || '';
        let fieldB = b[sortField] || '';

        if (sortField === 'scan_date') {
          return sortOrder === 'asc' 
            ? new Date(fieldA) - new Date(fieldB)
            : new Date(fieldB) - new Date(fieldA);
        }

        if (typeof fieldA === 'string') {
          fieldA = fieldA.toLowerCase();
          fieldB = fieldB.toLowerCase();
        }

        if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setInspections(sortedData);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch inspection records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, [search, status, location, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setLocation('');
    setSortField('scan_date');
    setSortOrder('desc');
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  };

  // Pagination calculations
  const totalItems = inspections.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inspections.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 antialiased text-slate-800">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inspection History logs</h2>
        <p className="text-xs text-slate-500 font-medium">Browse and search through all historical metrology compliance checks</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, brand, inspector..."
            className="block w-full rounded border border-slate-200 bg-white py-1.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Filters Dropdown/Input options */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-slate-800 focus:outline-hidden"
            >
              <option value="">All</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>

          {/* Location Input Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Location:</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai"
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-slate-800 focus:outline-hidden max-w-[120px]"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 rounded border border-slate-250 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        </div>

      </div>

      {/* History Grid Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-transparent mx-auto" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-700 font-semibold">{error}</div>
          ) : currentItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No inspections recorded.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-555 select-none">
                  <th 
                    onClick={() => handleSort('id')}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Audit ID
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Product details</th>
                  <th className="px-5 py-3">Inspector</th>
                  <th className="px-5 py-3">Location</th>
                  <th 
                    onClick={() => handleSort('scan_date')}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-155">
                {currentItems.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{i.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-slate-800 block">{i.product_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">GTIN: {i.product_barcode}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-650 font-medium">{i.inspector_name}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{i.location}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(i.scan_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span 
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          i.compliance_status === 'COMPLIANT'
                            ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                            : i.compliance_status === 'NON_COMPLIANT'
                            ? 'border-rose-250 bg-rose-50 text-rose-700'
                            : 'border-amber-250 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {formatStatus(i.compliance_status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => navigate(`/inspections/${i.id}`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer text-slate-750"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/inspection/${i.id}/review`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-blue-750 hover:bg-blue-55/20 cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => navigate(`/inspection/${i.id}/report`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-750 hover:bg-slate-50 cursor-pointer"
                      >
                        <FileText className="h-3 w-3" />
                        Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-55 py-3 px-5 text-xs text-slate-500 font-medium select-none">
            <div>
              Showing <span className="font-semibold text-slate-800">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {indexOfLastItem > totalItems ? totalItems : indexOfLastItem}
              </span> of <span className="font-semibold text-slate-800">{totalItems}</span> inspections
            </div>
            
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-0.5 rounded border border-slate-200 bg-white p-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-0.5 rounded border border-slate-200 bg-white p-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default InspectionHistory;
