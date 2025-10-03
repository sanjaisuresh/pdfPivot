import { useState } from "react";
import axios from "axios";

const HtmlToImagePage = () => {
  const [html, setHtml] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!html.trim()) {
      setError("Please enter some HTML content");
      setLoading(false);
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to use this feature");
        return;
      }

      // Track usage first
      await axios.post('/api/user/track', {
        service: 'convert-html-to-image',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Generate image
      const res = await axios.post("/api/html-to-image", 
        { html }, 
        { 
          responseType: "blob",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      setImageUrl(url);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">HTML to Image</h1>
          <p className="text-lg text-black">
            Convert your HTML code into an image
          </p>
        </div>

        <div className="bg-[#F4EDE4]  rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="html" className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  id="html"
                  rows={10}
                  placeholder="<div style='color: blue;'>Hello World!</div>"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  } transition duration-200`}
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
                    'Generate Image'
                  )}
                </button>
              </div>
            </form>

            {imageUrl && (
              <div className="mt-6 space-y-4">
                <div className="border rounded-lg p-4">
                  <img 
                    src={imageUrl} 
                    alt="Generated from HTML" 
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
                <div className="text-center">
                  <a
                    href={imageUrl}
                    download="html-image.png"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlToImagePage;
