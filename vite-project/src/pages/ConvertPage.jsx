import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ConvertPage = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [format, setFormat] = useState("png");
  const [convertedUrl, setConvertedUrl] = useState(null);
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
      setConvertedUrl(null);
      setError(null);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t("please_login"));
      setLoading(false);
      return;
    }

    // Check quota before conversion
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("format", format);

      // Track usage first
      await axios.post("/api/user/track", {
        service: format === 'jpg' ? 'jpg-to-pdf' : 'pdf-to-jpg',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Only proceed with conversion if tracking was successful
      const res = await axios.post("/api/convert", formData, {
        responseType: "blob",
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      setConvertedUrl(url);

    } catch (err) {
      console.error("Conversion failed:", err);
      if (err.response?.status === 401) {
        setError(t("please_login"));
      } else if (err.response?.status === 403) {
        setError(t("image_limit_reached"));
      } else {
        setError(t("failed_convert_image"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">{t("convert_image")}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t("convert_image_desc")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4]  rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleConvert} className="space-y-6">
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
                      {t("upload_image")}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload-convert" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>{t("upload_a_file")}</span>
                            <input 
                              id="file-upload-convert"
                              name="file-upload-convert"
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">{t("or_drag_and_drop")}</p>
                        </div>
                        <p className="text-xs text-gray-500">{t("image_formats")}</p>
                        {selectedFileName && (
                          <p className="mt-2 text-sm text-indigo-600 font-medium">
                            {t("selected")}: {selectedFileName}
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
                            alt={t("convert_image")}
                            className="absolute w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Format Selection */}
                  <div>
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("convert_to_format")}
                    </label>
                    <select
                      id="format"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-100 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg transition duration-200"
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="webp">WEBP</option>
                    </select>
                  </div>

                  {/* Convert Button */}
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
                          {t("converting")}
                        </>
                      ) : (
                        t("convert_image_btn")
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Download Section */}
              {convertedUrl && (
                <div className="mt-6 text-center">
                  <a
                    href={convertedUrl}
                    download={`converted.${format}`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t("download_converted_image")}
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

export default ConvertPage;
