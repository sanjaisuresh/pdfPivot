import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/CropImageHelper";
import axios from "axios";

const CropPage = () => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      setImage(URL.createObjectURL(file));
      setCroppedImage(null);
      setError(null);
    }
  };

  const handleCrop = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = await getCroppedImg(image, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(blob);
      setCroppedImage(croppedUrl);

      // Track usage
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await axios.post('/api/user/track', {
          service: 'modify-crop',
          imageCount: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error("Failed to track usage:", err);
        setError(err.response?.data?.error || 'Failed to track usage. Please try again later.');
      }
    } catch (err) {
      console.error("Cropping failed:", err);
      setError("Failed to crop image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">Crop Image</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Crop your images with precision using our interactive cropping tool
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
                          <label htmlFor="file-upload-crop" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload-crop"
                              name="file-upload-crop"
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                        {selectedFileName && (
                          <p className="mt-2 text-sm text-indigo-600 font-medium">
                            Selected: {selectedFileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cropper */}
                  {image && (
                    <div className="mt-4">
                      <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                        <Cropper
                          image={image}
                          crop={crop}
                          zoom={zoom}
                          aspect={4 / 3}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>
                      <div className="mt-4">
                        <label htmlFor="zoom" className="block text-sm font-medium text-gray-700 mb-1">
                          Zoom: {zoom.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          id="zoom"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Crop Button */}
                  {image && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleCrop}
                        disabled={loading || !image}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${
                          loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cropping...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Crop Image
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Preview and Download */}
                  {croppedImage && (
                    <div className="mt-6">
                      <div className="flex justify-center mb-4">
                        <div className="w-64 h-64 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={croppedImage}
                            alt="Cropped Preview"
                            className="absolute w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <a
                          href={croppedImage}
                          download="cropped-image.png"
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Cropped Image
                        </a>
                      </div>
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

export default CropPage;
