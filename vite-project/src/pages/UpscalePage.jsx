import { useRef, useState } from "react";
import axios from "axios";

const UpscalePage = () => {
  const [previewImage, setPreviewImage] = useState(null); // original image preview
  const [image, setImage] = useState(null); // upscaled image (hidden)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const canvasRef = useRef();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should be less than 2MB");
        return;
      }

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to use this feature");
        return;
      }

      try {
        // Check quota first
        await axios.post('/api/user/track', {
          service: 'optimize-upscale',
          imageCount: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Only proceed with upscaling if tracking was successful
        setSelectedFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            const upscaleFactor = 2;
            canvas.width = img.width * upscaleFactor;
            canvas.height = img.height * upscaleFactor;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Save upscaled image
            setImage(canvas.toDataURL());
            setError(null);
          };
          img.src = reader.result;
          setPreviewImage(reader.result); // show original image
        };
        reader.readAsDataURL(file);

      } catch (err) {
        console.error("Upscaling failed:", err);
        if (err.response?.status === 401) {
          setError("Please login to use this feature");
        } else if (err.response?.status === 403) {
          setError("You have reached your image processing limit. Please upgrade your plan.");
        } else {
          setError("Failed to upscale image. Please try again.");
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to use this feature");
        return;
      }

      const link = document.createElement("a");
      link.download = "upscaled-image.png";
      link.href = image;
      link.click();
      setError(null);
    } catch (err) {
      console.error("Failed to track usage:", err);
      if (err.response?.status === 401) {
        setError("Please login to use this feature");
      } else if (err.response?.status === 403) {
        setError("You have reached your image processing limit. Please upgrade your plan.");
      } else {
        setError("Failed to download image. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">Image Upscaler</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Enhance your image resolution up to 2× while maintaining quality
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
                      Upload Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload-upscale" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload-upscale"
                              name="file-upload-upscale"
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
                        {selectedFileName && (
                          <p className="mt-2 text-sm text-indigo-600 font-medium">
                            Selected: {selectedFileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  {previewImage && (
                    <div className="mt-6 space-y-4">
                      <div className="border rounded-lg overflow-hidden shadow-md">
                        <img
                          src={previewImage}
                          alt="Original Preview"
                          className="w-full object-contain max-h-[400px]"
                        />
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={handleDownload}
                          disabled={loading}
                          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Upscaled Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default UpscalePage;
