import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../shared/services/productService';
import { Search, Filter, RotateCcw, Eye, Scan, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductRepository = () => {
  const navigate = useNavigate();

  // Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Sort States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortField, setSortField] = useState('product_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      // Pass search and category filters to service layer
      const data = await getProducts({ search, category });
      
      // Sort the list locally
      const sortedData = [...data].sort((a, b) => {
        let fieldA = a[sortField] || '';
        let fieldB = b[sortField] || '';
        
        if (typeof fieldA === 'string') {
          fieldA = fieldA.toLowerCase();
          fieldB = fieldB.toLowerCase();
        }

        if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setProducts(sortedData);
      setCurrentPage(1); // Reset to page 1 on filter/sort change
    } catch (err) {
      setError('Failed to load products registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, category, sortField, sortOrder]);

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
    setCategory('');
    setSortField('product_name');
    setSortOrder('asc');
  };

  // Pagination logic
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 antialiased text-slate-800">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product Repository</h2>
          <p className="text-xs text-slate-500 font-medium">Verify compliance records and history logs of registered products</p>
        </div>
        <button
          onClick={() => navigate('/inspection/new')}
          className="inline-flex items-center gap-2 rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Scan className="h-4 w-4" />
          Start New Inspection
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Left: Search Bar input */}
        <div className="relative w-full md:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or barcode..."
            className="block w-full rounded border border-slate-200 bg-white py-1.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Right: Dropdowns & Reset */}
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-3.5 w-3.5 text-slate-555" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-slate-800 focus:outline-hidden"
            >
              <option value="">All Categories</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
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

      {/* Core Database Table */}
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
              No products found matching your search.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-555 select-none">
                  <th 
                    onClick={() => handleSort('product_name')}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Product Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('barcode')}
                    className="px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Barcode
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Manufacturer Details</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {currentItems.map((p) => (
                  <tr key={p.barcode} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-slate-900 block">{p.product_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">Brand: {p.brand}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-650">{p.barcode}</td>
                    <td className="px-5 py-4 text-slate-555 font-medium">{p.category}</td>
                    <td className="px-5 py-4 text-slate-500 max-w-sm truncate leading-relaxed">
                      {p.manufacturer}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => navigate(`/products/${p.barcode}`)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer text-slate-750"
                      >
                        <Eye className="h-3 w-3" />
                        View History
                      </button>
                      <button
                        onClick={() => navigate('/inspection/new')}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-blue-750 hover:bg-blue-55/20 cursor-pointer"
                      >
                        New Inspection
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
              </span> of <span className="font-semibold text-slate-800">{totalItems}</span> products
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

export default ProductRepository;
