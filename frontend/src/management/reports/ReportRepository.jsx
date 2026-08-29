import React, { useState, useEffect } from 'react';
import { getReports } from '../../shared/services/reportService';
import { Search, Filter, RotateCcw, FileText, Download, Printer, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ReportRepository = () => {
  // Data States
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReports({ search, status });
      
      const sortedData = [...data].sort((a, b) => {
        let fieldA = a[sortField] || '';
        let fieldB = b[sortField] || '';

        if (sortField === 'date') {
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

      setReports(sortedData);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch generated reports registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [search, status, sortField, sortOrder]);

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
    setSortField('date');
    setSortOrder('desc');
  };

  const handleDownload = (id) => {
    // Mock PDF download trigger
    alert(`Downloading PDF document package for ${id}...`);
  };

  const handlePrint = (id) => {
    // Mock Print dialog
    alert(`Opening print dialogue for report ${id}...`);
  };

  // Pagination calculations
  const totalItems = reports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 antialiased text-slate-800">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Report Repository</h2>
        <p className="text-xs text-slate-500 font-medium">Browse, review, and download generated LMPC legal compliance advisory notices</p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, ID, inspector..."
            className="block w-full rounded border border-slate-200 bg-white py-1.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Status Dropdowns */}
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Report Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-slate-800 focus:outline-hidden"
            >
              <option value="">All</option>
              <option value="Signed & Issued">Signed & Issued</option>
              <option value="Draft">Draft</option>
            </select>
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

      {/* Reports Table */}
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
              No reports archived in repository.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-555 select-none">
                  <th 
                    onClick={() => handleSort('reportId')}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Report ID
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Audit Reference ID</th>
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Notice Type</th>
                  <th 
                    onClick={() => handleSort('date')}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Date Issued
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-155">
                {currentItems.map((r) => (
                  <tr key={r.reportId} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{r.reportId}</td>
                    <td className="px-5 py-4 text-slate-550 font-mono text-[10px]">{r.inspectionId}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{r.productName}</td>
                    <td className="px-5 py-4 text-slate-550 font-medium">{r.reportType}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span 
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          r.status === 'Signed & Issued'
                            ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                            : 'border-slate-250 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleDownload(r.reportId)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-750 hover:bg-slate-50 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                      <button
                        onClick={() => handlePrint(r.reportId)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-750 hover:bg-slate-50 cursor-pointer"
                      >
                        <Printer className="h-3 w-3" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Toolbar */}
        {!loading && totalItems > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-55 py-3 px-5 text-xs text-slate-500 font-medium select-none">
            <div>
              Showing <span className="font-semibold text-slate-800">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {indexOfLastItem > totalItems ? totalItems : indexOfLastItem}
              </span> of <span className="font-semibold text-slate-800">{totalItems}</span> reports
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

export default ReportRepository;
