// -----------------------------------------
// AI Analyzer Page
// Upload product image for AI analysis
// -----------------------------------------
import { useState, useRef } from 'react';
import aiService from '../services/aiService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlinePhoto, HiOutlineArrowUpTray } from 'react-icons/hi2';

const AIAnalyzerPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first.');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.analyzeProduct(selectedFile);
      setAnalysis(res.data.data);
      toast.success('Analysis completed successfully.');
    } catch (error) {
      const message = error.response?.data?.message || 'Analysis failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-800">AI Product Analyzer</h1>
        <p className="text-sm text-surface-500 mt-1">
          Upload a product image to get quality analysis and pricing suggestions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-800 mb-4">Upload Product Image</h2>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
          >
            {preview ? (
              <img
                src={preview}
                alt="Product preview"
                className="max-h-60 mx-auto rounded-lg object-contain"
              />
            ) : (
              <div>
                <HiOutlinePhoto className="w-12 h-12 text-surface-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-surface-600">Click to upload an image</p>
                <p className="text-xs text-surface-400 mt-1">JPEG, PNG, GIF, WebP - Max 5MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50"
            >
              {loading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  Analyze Product
                </>
              )}
            </button>
            {selectedFile && (
              <button onClick={handleReset} className="btn-secondary">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-800 mb-4">Analysis Results</h2>

          {loading ? (
            <LoadingSpinner message="Analyzing your product..." />
          ) : analysis ? (
            <div className="space-y-4 animate-fade-in">
              {/* Product type and quality */}
              <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-primary-800">{analysis.productType}</span>
                  <span className="badge-info">{analysis.qualityLevel} Quality</span>
                </div>
                <div className="w-full bg-primary-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysis.qualityScore}%` }}
                  />
                </div>
                <p className="text-xs text-primary-600 mt-1">Quality Score: {analysis.qualityScore}/100</p>
              </div>

              {/* Price range */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-800">Estimated Price Range</p>
                <p className="text-lg font-bold text-emerald-700 mt-1">{analysis.estimatedPriceRange}</p>
              </div>

              {/* Quality hints */}
              <div>
                <p className="text-sm font-semibold text-surface-700 mb-2">Quality Assessment</p>
                <ul className="space-y-1.5">
                  {analysis.qualityHints?.map((hint, i) => (
                    <li key={i} className="text-sm text-surface-600 flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">--</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Possible defects */}
              <div>
                <p className="text-sm font-semibold text-surface-700 mb-2">Possible Issues</p>
                <ul className="space-y-1.5">
                  {analysis.possibleDefects?.map((defect, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">!</span>
                      {defect}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-sm font-semibold text-surface-700 mb-2">Improvement Suggestions</p>
                <ul className="space-y-1.5">
                  {analysis.suggestions?.map((suggestion, i) => (
                    <li key={i} className="text-sm text-surface-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">+</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HiOutlineSparkles className="w-12 h-12 text-surface-300 mb-3" />
              <p className="text-sm text-surface-500">
                Upload a product image and click "Analyze Product" to get AI-powered insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyzerPage;
