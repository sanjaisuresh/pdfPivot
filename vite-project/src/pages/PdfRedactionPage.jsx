import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PdfRedactionPage = () => {
  const [file, setFile] = useState(null);
  const [redactedFile, setRedactedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setRedactedFile(null);
        setError(null);
      }
    }
  });

  const handleRedact = async () => {
    if (!file || !fields.trim()) {
      setError('Please select a PDF file and enter fields to redact.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('fields', fields); // Update field name

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/pdf-redact`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setRedactedFile(blob);
      toast.success('PDF redacted successfully!');
    } catch (error) {
      console.error('Redaction error:', error);
      setError(error.message || 'Failed to redact PDF. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (redactedFile) {
      const url = URL.createObjectURL(redactedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'redacted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">PDF Redaction Tool</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Upload a PDF and enter sensitive fields to black out.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4] rounded-xl shadow-lg overflow-hidden">
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

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PDF File
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 cursor-pointer ${
                      isDragActive ? 'border-gold bg-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          Upload PDF
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 20MB</p>
                      {file && (
                        <div className="mt-2">
                          <p className="text-sm text-indigo-600 font-medium">
                            Selected file:
                          </p>
                          <p className="text-sm text-gray-500">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                    <input {...getInputProps()} className="sr-only" />
                  </div>
                </div>

                {/* Fields Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fields to Redact (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={fields}
                    onChange={(e) => setFields(e.target.value)}
                    placeholder="e.g. John Doe, SSN, Passport Number"
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-forest focus:border-forest sm:text-sm"
                  />
                </div>

                {/* Redact Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleRedact}
                    disabled={!file || !fields.trim() || loading}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                      !file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Redacting...
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2" />
                        Redact PDF
                      </>
                    )}
                  </button>
                </div>

                {/* Download Button */}
                {redactedFile && !loading && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      <FaDownload className="w-5 h-5 mr-2" />
                      Download Redacted PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfRedactionPage;
