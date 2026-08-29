import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getInspections } from '../../shared/services/inspectionService';
import { 
  Filter, 
  RotateCcw, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Page States
  const [stats, setStats] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [complianceStatus, setComplianceStatus] = useState('');
  const [inspector, setInspector] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('');

  // Load Dashboard Data
  const loadData = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const dashboardStats = await getDashboardStats(filters);
      const inspections = await getInspections(filters);
      
      setStats(dashboardStats);
      setRecentInspections(inspections.slice(0, 5));
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const activeFilters = {
      dateFrom,
      dateTo,
      category: productCategory,
      status: complianceStatus,
      inspector,
      location,
      severity
    };
    loadData(activeFilters);
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setProductCategory('');
    setComplianceStatus('');
    setInspector('');
    setLocation('');
    setSeverity('');
    loadData();
  };

  // Helper to format status for display (e.g. "NON_COMPLIANT" -> "Non-Compliant")
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-750 dark:border-slate-400 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-6 text-center text-rose-700 dark:text-rose-450">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <p className="font-semibold">{error}</p>
        <button 
          onClick={loadData} 
          className="mt-4 px-4 py-2 bg-slate-850 text-white rounded text-sm font-semibold hover:bg-slate-900 transition-colors"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { summary, charts } = stats;

  return (
    <div className="space-y-6 antialiased text-slate-850 dark:text-slate-200">
      
      {/* Title & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">National Compliance Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">LMPC Rules, 2011 Verification Summary</p>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-450 font-semibold self-start sm:self-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded">
          Last sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* 1. Filter Panel */}
      <form onSubmit={handleApplyFilters} className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Inspection Search Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Date Fields */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Compliance Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
              Compliance Status
            </label>
            <select
              value={complianceStatus}
              onChange={(e) => setComplianceStatus(e.target.value)}
              className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="WARNING">Warning</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Product Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
              Product Category
            </label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
            >
              <option value="">All Categories</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
            </select>
          </div>

          {/* Inspector name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
              Inspector
            </label>
            <input
              type="text"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              placeholder="e.g. Anil Mehta"
              className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-750 dark:text-slate-300 placeholder-slate-400 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
            />
          </div>

          {/* Location field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
              Inspection Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Reliance Smart, Noida"
              className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-750 dark:text-slate-300 placeholder-slate-400 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
            />
          </div>

          {/* Severity field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
              Violation Severity
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-slate-800 dark:focus:border-slate-700 focus:outline-hidden"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 rounded border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded bg-slate-850 dark:bg-slate-200 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5" />
            Apply Filters
          </button>
        </div>
      </form>

      {/* 2. StatCards Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total Inspections */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Audits</p>
          <p className="text-xl font-bold text-slate-850 dark:text-white mt-1">{summary.totalInspections}</p>
        </div>

        {/* Unique Products Scanned */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Products Registered</p>
          <p className="text-xl font-bold text-slate-850 dark:text-white mt-1">{summary.totalProducts}</p>
        </div>

        {/* Compliant */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 border-l-4 border-l-emerald-500 dark:border-slate-800 shadow-2xs">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Compliant</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{summary.compliant}</p>
        </div>

        {/* Non-Compliant */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 border-l-4 border-l-rose-500 dark:border-slate-800 shadow-2xs">
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider">Non-Compliant</p>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-455 mt-1">{summary.nonCompliant}</p>
        </div>

        {/* Warning */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 border-l-4 border-l-amber-500 dark:border-slate-800 shadow-2xs">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Advisory Warnings</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-450 mt-1">{summary.warning}</p>
        </div>

        {/* Violations Count */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Violations Flagged</p>
          <p className="text-xl font-bold text-slate-850 dark:text-white mt-1">{summary.totalViolations}</p>
        </div>

      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Compliance Overview & Inspection Trends */}
        <div className="space-y-6">
          
          {/* Compliance Overview (Pie Chart) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Compliance Status Distribution</h4>
            <div className="h-60">
              {summary.totalInspections === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No data matching active filters.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.complianceOverview.filter(c => c.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {charts.complianceOverview.filter(c => c.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#1e293b', color: '#f8fafc' }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Audit Trends Over Time (Line Chart) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Inspection Volume Trend</h4>
            <div className="h-60">
              {summary.totalInspections === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No data matching active filters.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#475569" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#475569" />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#475569' }} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      activeDot={{ r: 6 }} 
                      name="Inspections"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* Chart B: Violations by Category (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Violations Indexed by LMPC Category</h4>
            <div className="h-[520px]">
              {charts.violationsBreakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No violations detected under these criteria.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={charts.violationsBreakdown}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#475569" />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      tick={{ fontSize: 10, fill: '#cbd5e1' }} 
                      stroke="#475569" 
                      width={100}
                    />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#475569' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Offences Detected" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Recent Inspections Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/40 dark:bg-slate-950/20">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Enforcement Audits</h3>
          <button 
            onClick={() => navigate('/inspections')}
            className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 cursor-pointer"
          >
            View All Inspections
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {recentInspections.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
              No audit logs match your search filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-555 dark:text-slate-450 select-none">
                  <th className="px-5 py-3">Audit ID</th>
                  <th className="px-5 py-3">Product details</th>
                  <th className="px-5 py-3">Inspector</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Audit Rating</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                {recentInspections.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{i.id}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{i.product_name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">GTIN: {i.product_barcode}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-650 dark:text-slate-400 font-medium">{i.inspector_name}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">{i.location}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-450">
                      {new Date(i.scan_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span 
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          i.compliance_status === 'COMPLIANT'
                            ? 'border-emerald-250 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                            : i.compliance_status === 'NON_COMPLIANT'
                            ? 'border-rose-250 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
                            : 'border-amber-250 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {formatStatus(i.compliance_status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => navigate(`/inspections/${i.id}`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-750 dark:text-slate-300"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/inspection/${i.id}/review`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50/30 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => navigate(`/inspection/${i.id}/report`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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
      </div>

    </div>
  );
};

export default DashboardPage;
