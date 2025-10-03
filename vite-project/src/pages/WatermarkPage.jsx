import { useRef, useState, useEffect } from "react";
import axios from "axios";

const WatermarkPage = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("Watermark");
  const [opacity, setOpacity] = useState(0.5);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const imageRef = useRef();
  const textRef = useRef();
  const canvasRef = useRef();
  const containerRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const newImage = URL.createObjectURL(file);
      setImage(newImage);
      setError(null);
      // Reset position to center of new image
      setTimeout(() => {
        if (containerRef.current) {
          setPosition({
            x: containerRef.current.clientWidth / 2,
            y: containerRef.current.clientHeight / 2
          });
        }
      }, 100);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target === textRef.current) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate new position
    let newX = e.clientX - rect.left;
    let newY = e.clientY - rect.top;
    
    // Keep watermark within image boundaries
    newX = Math.max(0, Math.min(newX, container.clientWidth));
    newY = Math.max(0, Math.min(newY, container.clientHeight));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Add global mouse up handler
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDownload = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;
    
      // Get dimensions
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const displayWidth = img.clientWidth;
      const displayHeight = img.clientHeight;
    
      // Calculate ratio between display size and natural size
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
    
      // Set canvas dimensions to match natural image size
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
    
      // Draw original image
      ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
      
      // Enable clipping to image bounds
      ctx.beginPath();
      ctx.rect(0, 0, naturalWidth, naturalHeight);
      ctx.clip();
    
      // Draw watermark
      ctx.save();
      
      // Calculate the center position for the text based on preview position
      const centerX = position.x * scaleX;
      const centerY = position.y * scaleY;
      
      // Apply transformations in the correct order
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Set text properties
      ctx.globalAlpha = opacity;
      const fontSize = 40 * scale * scaleX;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 3 * scaleX;
      ctx.shadowOffsetX = 1 * scaleX;
      ctx.shadowOffsetY = 1 * scaleY;
      
      // Draw text centered at origin
      ctx.fillText(text, 0, 0);
      ctx.restore();
    
      // Create download link
      const link = document.createElement("a");
      link.download = "watermarked-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      // Track usage
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await axios.post('/api/user/track', {
          service: 'add-watermark',
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
      console.error("Failed to create watermark:", err);
      setError("Failed to create watermark. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">Add Watermark</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Add customizable watermarks to your images with drag-and-drop positioning
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
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
                          <label htmlFor="file-upload-watermark" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload-watermark"
                              name="file-upload-watermark"
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

                  {/* Watermark Controls */}
                  {image && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="watermark-text" className="block text-sm font-medium text-gray-700 mb-2">
                          Watermark Text
                        </label>
                        <input
                          id="watermark-text"
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter watermark text"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opacity: {opacity.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scale: {scale.toFixed(1)}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rotation: {rotation}°
                          </label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="1"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Preview with Watermark */}
                  {image && (
                    <div className="mt-4">
                      <div
                        ref={containerRef}
                        className="relative mx-auto border rounded-lg shadow-sm overflow-hidden bg-gray-800"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                      >
                        <img 
                          src={image} 
                          alt="Preview" 
                          ref={imageRef} 
                          className="max-w-full h-auto"
                        />
                        <div
                          ref={textRef}
                          style={{
                            position: "absolute",
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            opacity,
                            transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                            cursor: isDragging ? "grabbing" : "grab",
                            color: "white",
                            fontSize: "40px",
                            fontWeight: "bold",
                            userSelect: "none",
                            textAlign: "center",
                            textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                            pointerEvents: "auto"
                          }}
                        >
                          {text}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        Drag the watermark text to position it on the image
                      </p>
                    </div>
                  )}

                  {/* Download Button */}
                  {image && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleDownload}
                        disabled={loading}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 ${
                          loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Watermarked Image
                          </>
                        )}
                      </button>
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

export default WatermarkPage;