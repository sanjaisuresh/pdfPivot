import { useState, useRef } from "react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const RotatePage = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const canvasRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setSelectedFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      setRotation(0);
      setError(null);
    }
  };

  const rotateImage = async (direction) => {
    if (!image) {
      setError(t('rotate_page.please_upload_image'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate new rotation
      const newRotation = direction === "right" ? rotation + 90 : rotation - 90;
      setRotation(newRotation);

      // Create a canvas element if it doesn't exist
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Create an image object
      const img = new Image();
      img.src = URL.createObjectURL(image);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Set canvas dimensions based on rotation
      if (Math.abs(newRotation % 180) === 90) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Clear the canvas and save its state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Rotate the canvas
      ctx.rotate((newRotation * Math.PI) / 180);

      // Draw the image
      if (Math.abs(newRotation % 180) === 90) {
        ctx.drawImage(img, -img.height / 2, -img.width / 2);
      } else {
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      }

      // Restore the canvas state
      ctx.restore();

      // Convert canvas to blob and create URL
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Track usage
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await axios.post('/api/user/track', {
          service: 'rotate-pdf',
          imageCount: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error("Failed to track usage:", err);
        setError(err.response?.data?.error || t('rotate_page.failed_track_usage'));
      }
    } catch (err) {
      console.error("Rotation failed:", err);
      setError(t('rotate_page.failed_rotate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">{t('rotate_page.title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('rotate_page.desc')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4]  rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
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
                      {t('rotate_page.upload_image')}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload-rotate" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>{t('rotate_page.upload_a_file')}</span>
                            <input 
                              id="file-upload-rotate"
                              name="file-upload-rotate"
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
                            {t('selected_file', { name: selectedFileName, size: (image.size / (1024 * 1024)).toFixed(2) })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mt-4">
                      <div className="flex justify-center">
                        <div className="w-64 h-64 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="absolute w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rotation Controls */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => rotateImage("left")}
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
                          {t('rotate_page.rotating')}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          {t('rotate_page.rotate_left')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => rotateImage("right")}
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
                          {t('rotate_page.rotating')}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          {t('rotate_page.rotate_right')}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Download Section */}
                  {previewUrl && (
                    <div className="mt-6 text-center">
                      <a
                        href={previewUrl}
                        download="rotated-image.png"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('rotate_page.download_rotated_image')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatePage;
