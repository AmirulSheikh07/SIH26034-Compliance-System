import { mockProducts, mockScans } from '../data/mockData';

export const getProducts = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...mockProducts];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.product_name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            p.barcode.includes(query)
        );
      }

      if (filters.category) {
        result = result.filter((p) => p.category === filters.category);
      }

      resolve(result);
    }, 300);
  });
};

export const getProductByBarcode = async (barcode) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p.barcode === barcode);
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found in repository.'));
      }
    }, 200);
  });
};

export const getProductInspections = async (barcode) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const history = mockScans
        .filter((s) => s.product_barcode === barcode)
        .sort((a, b) => new Date(b.scan_date) - new Date(a.scan_date)); // Newest first
      resolve(history);
    }, 200);
  });
};
