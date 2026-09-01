import { mockReports } from '../data/mockData';

export const getReports = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...mockReports];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (r) =>
            r.productName.toLowerCase().includes(query) ||
            r.reportId.toLowerCase().includes(query) ||
            r.reportType.toLowerCase().includes(query) ||
            r.generatedBy.toLowerCase().includes(query)
        );
      }

      if (filters.status) {
        result = result.filter((r) => r.status === filters.status);
      }

      resolve(result);
    }, 200);
  });
};

export const getReportById = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const report = mockReports.find((r) => r.reportId === id);
      if (report) {
        resolve(report);
      } else {
        reject(new Error('Report not found.'));
      }
    }, 150);
  });
};
