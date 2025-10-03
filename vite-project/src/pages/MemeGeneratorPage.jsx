import { useState, useRef } from "react";
import axios from "axios";

const MemeGeneratorPage = () => {
  const [image, setImage] = useState(null);
  const [topText, setTopText] = useState("Top Text");
  const [bottomText, setBottomText] = useState("Bottom Text");
  const [position, setPosition] = useState("inside"); // inside or outside
  const [bgColor, setBgColor] = useState("white");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const canvasRef = useRef();
  const imageRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return;
      }
      setSelectedFileName(file.name);
      setImage(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      const padding = position === "outside" ? 80 : 0;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight + padding * 2;

      if (position === "outside") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, padding); // top pad
        ctx.fillRect(0, canvas.height - padding, canvas.width, padding); // bottom pad
      }

      // draw image
      const yOffset = position === "outside" ? padding : 0;
      ctx.drawImage(img, 0, yOffset);

      // draw texts
      ctx.fillStyle = bgColor === "black" ? "white" : "black";
      ctx.font = "40px Impact";
      ctx.textAlign = "center";

      if (position === "inside") {
        ctx.fillStyle = "white";
        ctx.fillText(topText, canvas.width / 2, yOffset + 50);
        ctx.fillText(bottomText, canvas.width / 2, yOffset + img.naturalHeight - 30);
      } else {
        ctx.fillText(topText, canvas.width / 2, 50);
        ctx.fillText(bottomText, canvas.width / 2, canvas.height - 30);
      }

      // Track usage
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await axios.post('/api/user/track', {
          service: 'create-meme',
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

      const link = document.createElement("a");
      link.download = "meme.png";
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      setError(err.response?.data?.message || "Error generating meme");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">Meme Generator</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Create custom memes with text inside or outside the image
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

                <div className="space-y-6">
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
                          <label htmlFor="file-upload-meme" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload-meme"
                              name="file-upload-meme"
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

                  {/* Text Controls */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="top-text" className="block text-sm font-medium text-gray-700 mb-2">
                        Top Text
                      </label>
                      <input
                        id="top-text"
                        type="text"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter top text"
                      />
                    </div>
                    <div>
                      <label htmlFor="bottom-text" className="block text-sm font-medium text-gray-700 mb-2">
                        Bottom Text
                      </label>
                      <input
                        id="bottom-text"
                        type="text"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter bottom text"
                      />
                    </div>
                  </div>

                  {/* Position and Color Controls */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Position
                      </label>
                      <div className="mt-1 space-x-6">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="position"
                            value="inside"
                            checked={position === "inside"}
                            onChange={(e) => setPosition(e.target.value)}
                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Inside Image</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="position"
                            value="outside"
                            checked={position === "outside"}
                            onChange={(e) => setPosition(e.target.value)}
                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Outside Image</span>
                        </label>
                      </div>
                    </div>
                    
                    {position === "outside" && (
                      <div>
                        <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <select
                          id="bg-color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        >
                          <option value="white">White Background</option>
                          <option value="black">Black Background</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  {image && (
                    <div className="mt-6 space-y-4">
                      <div className="border rounded-lg overflow-hidden shadow-md">
                        {position === "outside" && (
                          <div
                            className="w-full text-center py-3 font-bold text-xl"
                            style={{ backgroundColor: bgColor, color: bgColor === "black" ? "white" : "black" }}
                          >
                            {topText}
                          </div>
                        )}
                        <div className="relative">
                          <img 
                            src={image} 
                            ref={imageRef} 
                            alt="Preview" 
                            className="w-full object-contain max-h-[400px]" 
                          />
                          {position === "inside" && (
                            <>
                              <div className="absolute top-2 w-full text-center font-bold text-xl text-white drop-shadow-lg">
                                {topText}
                              </div>
                              <div className="absolute bottom-2 w-full text-center font-bold text-xl text-white drop-shadow-lg">
                                {bottomText}
                              </div>
                            </>
                          )}
                        </div>
                        {position === "outside" && (
                          <div
                            className="w-full text-center py-3 font-bold text-xl"
                            style={{ backgroundColor: bgColor, color: bgColor === "black" ? "white" : "black" }}
                          >
                            {bottomText}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center">
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
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download Meme
                            </>
                          )}
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

export default MemeGeneratorPage;
