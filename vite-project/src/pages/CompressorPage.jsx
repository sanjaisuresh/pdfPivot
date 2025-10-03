import { useState } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const CompressorPage = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setSelectedFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      setCompressedUrl(null);
      setError(null);
    }
  };

  const compressImage = async () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Create a promise to handle image loading
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });

    // Calculate new dimensions
    let newWidth = width ? parseInt(width) : img.width;
    let newHeight = height ? parseInt(height) : img.height;

    // If only one dimension is specified, maintain aspect ratio
    if (width && !height) {
      newHeight = (img.height / img.width) * newWidth;
    } else if (height && !width) {
      newWidth = (img.width / img.height) * newHeight;
    }

    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw image on canvas
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert to blob with specified quality
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', quality / 100);
    });

    return blob;
  };

  const handleCompress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }

    try {
      // Check quota first
      const trackRes = await axios.post('/api/user/track', {
        service: 'compress-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Only proceed with compression if tracking was successful
      const compressedBlob = await compressImage();
      const url = URL.createObjectURL(compressedBlob);
      setCompressedUrl(url);

    } catch (err) {
      console.error("Compression failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('image_limit_reached'));
      } else {
        setError(t('failed_compress_image'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">{t('compress_image')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('compress_image_desc')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4]  rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleCompress} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('upload_image')}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>{t('upload_a_file')}</span>
                            <input 
                              id="file-upload"
                              name="file-upload"
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">{t('or_drag_and_drop')}</p>
                        </div>
                        <p className="text-xs text-gray-500">{t('image_formats')}</p>
                        {selectedFileName && (
                          <p className="mt-2 text-sm text-indigo-600 font-medium">
                            {t('selected')}: {selectedFileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Small Preview */}
                  {previewUrl && (
                    <div className="mt-4">
                      <div className="flex justify-center">
                        <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="absolute w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Compression Settings */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Quality Slider */}
                    <div className="col-span-2">
                      <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('compression_quality')} ({quality}%)
                      </label>
                      <input
                        type="range"
                        id="quality"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Width Input */}
                    <div>
                      <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('width_optional')}
                      </label>
                      <input
                        type="number"
                        id="width"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder={t('original_width')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Height Input */}
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('height_optional')}
                      </label>
                      <input
                        type="number"
                        id="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder={t('original_height')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Compress Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || !image}
                      className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${
                        loading || !image ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('compressing')}
                        </>
                      ) : (
                        t('compress_image_btn')
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Download Section */}
              {compressedUrl && (
                <div className="mt-6 text-center">
                  <a
                    href={compressedUrl}
                    download="compressed-image.jpg"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('download_compressed_image')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressorPage;
