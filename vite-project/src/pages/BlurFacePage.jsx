import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BlurFacePage = () => {
  const [image, setImage] = useState(null);
  const [blurAreas, setBlurAreas] = useState([]);
  const [imgObj, setImgObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const canvasRef = useRef();
  const containerRef = useRef();

  const MAX_WIDTH = 600;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return;
      }
      setSelectedFileName(file.name);
      const img = new Image();
      img.onload = () => {
        setImgObj(img);
        drawCanvas(img, blurAreas);
      };
      img.src = URL.createObjectURL(file);
      setImage(img.src);
      setBlurAreas([]);
      setError(null);
    }
  };

  const drawCanvas = (img, areas) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const ratio = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
    const width = img.width * ratio;
    const height = img.height * ratio;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    areas.forEach(({ x, y, width: areaWidth, height: areaHeight }) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = areaWidth;
      offscreen.height = areaHeight;
      const offCtx = offscreen.getContext("2d");

      offCtx.filter = "blur(10px)";
      offCtx.drawImage(canvas, x, y, areaWidth, areaHeight, 0, 0, areaWidth, areaHeight);
      ctx.drawImage(offscreen, 0, 0, areaWidth, areaHeight, x, y, areaWidth, areaHeight);
    });
  };

  const addBlurArea = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please login to use this feature");
      return;
    }

    try {
      // Check quota first
      const trackRes = await axios.post('/api/user/track', {
        service: 'security-blur-face',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Only add blur area if tracking was successful
      const canvas = canvasRef.current;
      setBlurAreas((prev) => [...prev, { 
        x: 50,
        y: 50,
        width: 100,
        height: 100
      }]);

    } catch (err) {
      console.error("Failed to track usage:", err);
      if (err.response?.status === 401) {
        setError("Please login to use this feature");
      } else if (err.response?.status === 403) {
        setError("You have reached your image processing limit. Please upgrade your plan.");
      } else {
        setError("Failed to add blur area. Please try again.");
      }
    }
  };

  const handleDrag = (index, { clientX, clientY }) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const updated = [...blurAreas];
    const area = updated[index];

    // Update position while keeping within bounds
    updated[index] = {
      ...area,
      x: Math.max(0, Math.min(x - area.width / 2, canvas.width - area.width)),
      y: Math.max(0, Math.min(y - area.height / 2, canvas.height - area.height))
    };

    setBlurAreas(updated);
    drawCanvas(imgObj, updated);
  };

  const handleResize = (index, { movementX, movementY, clientX, clientY }) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const updated = [...blurAreas];
    const area = updated[index];

    // Scale the movements
    const scaledMovementX = movementX * scaleX;
    const scaledMovementY = movementY * scaleY;

    // Update size while keeping within bounds
    const newWidth = Math.max(20, Math.min(area.width + scaledMovementX, canvas.width - area.x));
    const newHeight = Math.max(20, Math.min(area.height + scaledMovementY, canvas.height - area.y));

    updated[index] = {
      ...area,
      width: newWidth,
      height: newHeight
    };

    setBlurAreas(updated);
    drawCanvas(imgObj, updated);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "blurred-image.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (imgObj) drawCanvas(imgObj, blurAreas);
  }, [blurAreas]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">Face Blur Tool</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Protect privacy by blurring faces in your images
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
                          <label htmlFor="file-upload-blur" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload-blur"
                              name="file-upload-blur"
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

                  {/* Canvas and Controls */}
                  {image && (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <button
                          onClick={addBlurArea}
                          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Blur Area
                        </button>
                      </div>

                      <div ref={containerRef} className="relative mx-auto border rounded-lg overflow-hidden shadow-md">
                        <canvas ref={canvasRef} className="w-full" />
                        {blurAreas.map((area, index) => {
                          const canvas = canvasRef.current;
                          if (!canvas) return null;
                          
                          const rect = canvas.getBoundingClientRect();
                          const scaleX = rect.width / canvas.width;
                          const scaleY = rect.height / canvas.height;

                          return (
                            <div
                              key={index}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const startX = e.clientX;
                                const startY = e.clientY;

                                const onMove = (ev) => {
                                  handleDrag(index, ev);
                                };

                                const onUp = () => {
                                  window.removeEventListener("mousemove", onMove);
                                  window.removeEventListener("mouseup", onUp);
                                };

                                window.addEventListener("mousemove", onMove);
                                window.addEventListener("mouseup", onUp);
                              }}
                              style={{
                                position: "absolute",
                                left: `${area.x * scaleX}px`,
                                top: `${area.y * scaleY}px`,
                                width: `${area.width * scaleX}px`,
                                height: `${area.height * scaleY}px`,
                                border: "2px solid red",
                                backgroundColor: "rgba(255,255,255,0.15)",
                                cursor: "move",
                              }}
                            >
                              <div
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  const onMove = (ev) => {
                                    handleResize(index, {
                                      movementX: ev.movementX,
                                      movementY: ev.movementY,
                                      clientX: ev.clientX,
                                      clientY: ev.clientY
                                    });
                                  };

                                  const onUp = () => {
                                    window.removeEventListener("mousemove", onMove);
                                    window.removeEventListener("mouseup", onUp);
                                  };

                                  window.addEventListener("mousemove", onMove);
                                  window.addEventListener("mouseup", onUp);
                                }}
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  width: 16,
                                  height: 16,
                                  backgroundColor: "blue",
                                  cursor: "nwse-resize",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Blurred Image
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
    </div>
  );
};

export default BlurFacePage;
