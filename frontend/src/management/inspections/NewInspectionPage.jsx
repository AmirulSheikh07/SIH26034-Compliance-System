import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Play, 
  Building2, 
  Tag, 
  MapPin, 
  User, 
  Calendar, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';

export default function NewInspectionPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: 'Packaged Food',
    manufacturer: '',
    inspectionLocation: '',
    inspectorName: 'Inspector Admin',
    inspectionDate: new Date().toISOString().split('T')[0],
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle Form Field Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Process File Uploads
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages((prev) => [...prev, ...newImages]);
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove Image
  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return filtered;
    });
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand name is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer details are required';
    if (!formData.inspectionLocation.trim()) newErrors.inspectionLocation = 'Inspection location is required';
    if (!formData.inspectorName.trim()) newErrors.inspectorName = 'Inspector name is required';
    if (!formData.inspectionDate) newErrors.inspectionDate = 'Inspection date is required';
    if (images.length === 0) newErrors.images = 'At least one product/label image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Start Scan & Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsScanning(true);

    // Mock Backend Processing Simulation
    setTimeout(() => {
      setIsScanning(false);
      const mockInspectionId = 'INSP-' + Math.floor(100000 + Math.random() * 900000);
      navigate(`/inspection/${mockInspectionId}/analysis`);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Product Inspection</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload product labels to initiate Legal Metrology compliance verification.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Metadata Form Section */}
          <div className="lg:col-span-2 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Inspection Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g. Atta Whole Wheat Flour"
                  className={`w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.productName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Aashirvaad"
                  className={`w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.brand ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Pharmaceuticals">Pharmaceuticals</option>
                    <option value="Other Commodities">Other Commodities</option>
                  </select>
                </div>
              </div>

              {/* Manufacturer/Packer/Importer */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Manufacturer / Packer / Importer *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g. ITC Limited, Kolkata"
                  className={`w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.manufacturer ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.manufacturer && <p className="text-xs text-red-500 mt-1">{errors.manufacturer}</p>}
              </div>

              {/* Inspection Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> Inspection Location *
                </label>
                <input
                  type="text"
                  name="inspectionLocation"
                  value={formData.inspectionLocation}
                  onChange={handleChange}
                  placeholder="e.g. Supermarket Mart, Warehouse A"
                  className={`w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.inspectionLocation ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.inspectionLocation && <p className="text-xs text-red-500 mt-1">{errors.inspectionLocation}</p>}
              </div>

              {/* Inspector Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-4 h-4 text-slate-400" /> Inspector Name *
                </label>
                <input
                  type="text"
                  name="inspectorName"
                  value={formData.inspectorName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.inspectorName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.inspectorName && <p className="text-xs text-red-500 mt-1">{errors.inspectorName}</p>}
              </div>

              {/* Inspection Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> Inspection Date *
                </label>
                <input
                  type="date"
                  name="inspectionDate"
                  value={formData.inspectionDate}
                  onChange={handleChange}
                  className={`w-full md:w-1/2 px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.inspectionDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.inspectionDate && <p className="text-xs text-red-500 mt-1">{errors.inspectionDate}</p>}
              </div>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 h-fit space-y-3">
            <h3 className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Upload Guidelines
            </h3>
            <ul className="text-xs text-indigo-900/80 dark:text-indigo-300/80 space-y-2 list-disc list-inside">
              <li>Ensure clear images of front label, back panel, and MRP declaration.</li>
              <li>Avoid glares or motion blur over legal texts and net quantities.</li>
              <li>Multiple angle captures improve OCR accuracy.</li>
            </ul>
          </div>
        </div>

        {/* Drag and Drop Image Upload */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Product & Label Images</h2>
            <span className="text-xs text-slate-500">{images.length} image(s) uploaded</span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                : errors.images
                ? 'border-red-400 bg-red-50/30 dark:bg-red-950/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Drag & drop product images here, or{' '}
                  <label className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline font-semibold">
                    browse files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, JPEG up to 10MB each</p>
              </div>
            </div>
          </div>
          {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square">
                  <img
                    src={img.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-colors disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning & Extracting Legal Declarations...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Start Scan & Compliance Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}