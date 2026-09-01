import { mockScans, mockProducts } from '../data/mockData';
import { apiRequest } from './apiClient';

// Helper to check if a date string falls within a range (for local mock filtering)
const isDateInRange = (dateStr, from, to) => {
  if (!from && !to) return true;
  const date = new Date(dateStr);
  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (date < fromDate) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (date > toDate) return false;
  }
  return true;
};

// Local fallback filter function
const filterScansLocally = (filters = {}) => {
  let result = [...mockScans];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.product_name.toLowerCase().includes(query) ||
        s.brand.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.inspector_name.toLowerCase().includes(query)
    );
  }

  if (filters.status) {
    result = result.filter(
      (s) => s.compliance_status.toLowerCase() === filters.status.toLowerCase()
    );
  }

  if (filters.location) {
    result = result.filter((s) =>
      s.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  if (filters.inspector) {
    result = result.filter((s) =>
      s.inspector_name.toLowerCase().includes(filters.inspector.toLowerCase())
    );
  }

  if (filters.dateFrom || filters.dateTo) {
    result = result.filter((s) =>
      isDateInRange(s.scan_date, filters.dateFrom, filters.dateTo)
    );
  }

  if (filters.category) {
    result = result.filter((s) => {
      const product = mockProducts.find((p) => p.barcode === s.product_barcode);
      return product && product.category === filters.category;
    });
  }

  if (filters.severity) {
    result = result.filter((s) =>
      s.violations.some((v) => v.severity.toLowerCase() === filters.severity.toLowerCase())
    );
  }

  return result;
};

// Local fallback stats calculator
const getLocalStats = (filters = {}) => {
  const filteredScans = filterScansLocally(filters);
  const totalInspections = filteredScans.length;
  const distinctBarcodes = [...new Set(filteredScans.map(s => s.product_barcode))];
  const totalProducts = distinctBarcodes.length;
  
  const compliant = filteredScans.filter(s => s.compliance_status === 'COMPLIANT').length;
  const nonCompliant = filteredScans.filter(s => s.compliance_status === 'NON_COMPLIANT').length;
  const warning = filteredScans.filter(s => s.compliance_status === 'WARNING').length;
  const pending = filteredScans.filter(s => s.compliance_status === 'PENDING').length;

  let totalViolations = 0;
  const violationCategoryCounts = {};

  filteredScans.forEach(s => {
    totalViolations += s.violations.length;
    s.violations.forEach(v => {
      const cleanName = v.violation || v.name || "Unknown Violation";
      violationCategoryCounts[cleanName] = (violationCategoryCounts[cleanName] || 0) + 1;
    });
  });

  const violationsChartData = Object.keys(violationCategoryCounts).map(key => ({
    category: key,
    count: violationCategoryCounts[key]
  }));

  const trendsChartData = [
    { month: 'May', count: Math.round(totalInspections * 0.4) },
    { month: 'Jun', count: Math.round(totalInspections * 0.7) },
    { month: 'Jul', count: Math.round(totalInspections * 0.9) },
    { month: 'Aug', count: totalInspections }
  ];

  return {
    summary: {
      totalInspections,
      totalProducts,
      compliant,
      nonCompliant,
      warning,
      pending,
      totalViolations
    },
    charts: {
      complianceOverview: [
        { name: 'Compliant', value: compliant, color: '#10b981' },
        { name: 'Non-Compliant', value: nonCompliant, color: '#f43f5e' },
        { name: 'Warning', value: warning, color: '#f59e0b' },
        { name: 'Pending', value: pending, color: '#64748b' }
      ],
      violationsBreakdown: violationsChartData,
      trends: trendsChartData
    }
  };
};

// Build URL query string helper
const buildQuery = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// ---------------- API SERVICES WIRED TO BACKEND ----------------

export const getInspections = async (filters = {}) => {
  const query = buildQuery(filters);
  const localFallback = filterScansLocally(filters);
  
  // Call FastAPI backend GET /scans (or /api/scans depending on route prefixes)
  return apiRequest(`/scans${query}`, { method: 'GET' }, localFallback);
};

export const getInspectionById = async (id) => {
  const localFallback = mockScans.find((s) => s.id === id);
  
  // Call FastAPI backend GET /scans/{id}
  return apiRequest(`/scans/${id}`, { method: 'GET' }, localFallback);
};

export const getDashboardStats = async (filters = {}) => {
  const query = buildQuery(filters);
  const localFallback = getLocalStats(filters);
  
  // Call FastAPI backend GET /dashboard/stats
  return apiRequest(`/dashboard/stats${query}`, { method: 'GET' }, localFallback);
};
