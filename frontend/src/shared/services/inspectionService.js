import { mockScans, mockProducts } from '../data/mockData';

// Helper to check if a date string falls within a range
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

// Core helper to filter scans array matching Team Contract
const filterScansList = (filters = {}) => {
  let result = [...mockScans];

  // 1. Text Search (Matches ID, name, brand, or inspector)
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

  // 2. Compliance Status Filter (COMPLIANT, NON_COMPLIANT, WARNING, PENDING)
  if (filters.status) {
    result = result.filter(
      (s) => s.compliance_status.toLowerCase() === filters.status.toLowerCase()
    );
  }

  // 3. Location Filter (Case-insensitive substring)
  if (filters.location) {
    result = result.filter((s) =>
      s.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  // 4. Inspector Name Filter (Case-insensitive substring)
  if (filters.inspector) {
    result = result.filter((s) =>
      s.inspector_name.toLowerCase().includes(filters.inspector.toLowerCase())
    );
  }

  // 5. Date Range Filter
  if (filters.dateFrom || filters.dateTo) {
    result = result.filter((s) =>
      isDateInRange(s.scan_date, filters.dateFrom, filters.dateTo)
    );
  }

  // 6. Product Category Filter (requires product lookup)
  if (filters.category) {
    result = result.filter((s) => {
      const product = mockProducts.find((p) => p.barcode === s.product_barcode);
      return product && product.category === filters.category;
    });
  }

  // 7. Violation Severity Filter (checks if any violation matches the severity)
  if (filters.severity) {
    result = result.filter((s) =>
      s.violations.some((v) => v.severity.toLowerCase() === filters.severity.toLowerCase())
    );
  }

  return result;
};

export const getInspections = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = filterScansList(filters);
      resolve(filtered);
    }, 200);
  });
};

export const getInspectionById = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const scan = mockScans.find((s) => s.id === id);
      if (scan) {
        resolve(scan);
      } else {
        reject(new Error('Inspection record not found.'));
      }
    }, 200);
  });
};

export const getDashboardStats = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter list of scans first so stats match the query
      const filteredScans = filterScansList(filters);
      
      const totalInspections = filteredScans.length;
      
      // Calculate active distinct products in this filtered set
      const distinctBarcodes = [...new Set(filteredScans.map(s => s.product_barcode))];
      const totalProducts = distinctBarcodes.length;
      
      const compliant = filteredScans.filter(s => s.compliance_status === 'COMPLIANT').length;
      const nonCompliant = filteredScans.filter(s => s.compliance_status === 'NON_COMPLIANT').length;
      const warning = filteredScans.filter(s => s.compliance_status === 'WARNING').length;
      const pending = filteredScans.filter(s => s.compliance_status === 'PENDING').length;

      // Count violations in this filtered set
      let totalViolations = 0;
      const violationCategoryCounts = {};

      filteredScans.forEach(s => {
        totalViolations += s.violations.length;
        s.violations.forEach(v => {
          // Use standard LMPC violation name mappings
          const cleanName = v.violation || v.name || "Unknown Violation";
          violationCategoryCounts[cleanName] = (violationCategoryCounts[cleanName] || 0) + 1;
        });
      });

      // Format violation breakdown chart data
      const violationsChartData = Object.keys(violationCategoryCounts).map(key => ({
        category: key,
        count: violationCategoryCounts[key]
      }));

      // Mock historical trends
      const trendsChartData = [
        { month: 'May', count: Math.round(totalInspections * 0.4) },
        { month: 'Jun', count: Math.round(totalInspections * 0.7) },
        { month: 'Jul', count: Math.round(totalInspections * 0.9) },
        { month: 'Aug', count: totalInspections }
      ];

      resolve({
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
      });
    }, 200);
  });
};
