import axios from 'axios';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'react-hot-toast';
import { useTranslation } from "react-i18next";

const OrganizePdfPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [pageOrder, setPageOrder] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  // Helper to get page numbers for drag-and-drop
  const getPageNumbers = () => {
    if (pageOrder.length > 0) return pageOrder;
    return Array.from({ length: totalPages }, (_, i) => i);
  };

  // Handle PDF upload and get total pages
  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f || f.type !== 'application/pdf') {
      setError(t('organize_pdf.select_pdf_only'));
      setFile(null);
      setTotalPages(0);
      setPageOrder([]);
      return;
    }
    setFile(f);
    setError(null);
    setPdfUrl(null);
    setPageOrder([]);
    // Get total pages using pdf-lib
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
    } catch (err) {
      setError(t('organize_pdf.failed_load_pdf'));
      setFile(null);
      setTotalPages(0);
      setPageOrder([]);
    }
  };

  // Drag and drop reordering
  const handleDragStart = (idx) => (e) => {
    e.dataTransfer.setData('pageIdx', idx);
  };
  const handleDrop = (idx) => (e) => {
    const fromIdx = parseInt(e.dataTransfer.getData('pageIdx'));
    if (fromIdx === idx) return;
    const newOrder = getPageNumbers().slice();
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(idx, 0, moved);
    setPageOrder(newOrder);
  };
  const handleDragOver = (e) => e.preventDefault();

  // Submit reordered PDF (now all in frontend)
  const handleReorder = async () => {
    if (!file) {
      setError(t('organize_pdf.upload_pdf'));
      return;
    }
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t("please_login"));
      setLoading(false);
      return;
    }
    try {
      const trackRes = await axios.post('/api/user/track', {
        service: 'organize-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      const order = getPageNumbers();
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, order);
      copiedPages.forEach((page) => newPdfDoc.addPage(page));
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      toast.success(t('organize_pdf.success'));
    } catch (err) {
      console.error("Compression failed:", err);
      if (err.response?.status === 401) {
        setError(t("please_login"));
      } else if (err.response?.status === 403) {
        setError(t("limit_reached"));
      } else {
        setError(t("organize_pdf.failed"));
      }
    }
    setLoading(false);
  };

  return (
    <>
    <Helmet>
      {/* Primary SEO tags */}
      <title>Organize PDF Pages Online Free | Rearrange Easily</title>
      <meta
        name="description"
        content="Organize PDF pages online with PDFPivot. Drag and drop to reorder pages in seconds. Fast, secure, and free—no sign-up or download required."
      />

      {/* Open Graph (no image) */}
      <meta property="og:title" content="Organize PDF Pages Online Free | Rearrange Easily" />
      <meta
        property="og:description"
        content="Organize PDF pages online with PDFPivot. Drag and drop to reorder pages in seconds. Fast, secure, and free—no sign-up or download required."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/organize-pdf" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Organize PDF Pages Online Free | Rearrange Easily" />
      <meta
        name="twitter:description"
        content="Organize PDF pages online with PDFPivot. Drag and drop to reorder pages in seconds. Fast, secure, and free—no sign-up or download required."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">{t('organize_pdf.title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('organize_pdf.desc')}
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
                    {t("upload_pdf")}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload-organize" className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          <span>{t("upload_pdf_file")}</span>
                          <input
                            id="file-upload-organize"
                            name="file-upload-organize"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">{t("or_drag_and_drop")}</p>
                      </div>
                      <p className="text-xs text-gray-500">{t("pdf_up_to_20mb")}</p>
                      {file && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          {t("selected")}: {file.name} ({totalPages} {t('organize_pdf.pages')})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Drag to reorder pages */}
                {file && totalPages > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organize_pdf.drag_reorder')}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getPageNumbers().map((pageIdx, idx) => (
                        <div
                          key={pageIdx}
                          draggable
                          onDragStart={handleDragStart(idx)}
                          onDrop={handleDrop(idx)}
                          onDragOver={handleDragOver}
                          className="w-16 h-20 bg-white border border-gray-300 rounded flex items-center justify-center shadow cursor-move text-lg font-bold text-forest"
                        >
                          {pageIdx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Reorder Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleReorder}
                    disabled={!file || loading}
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
                        {t('organize_pdf.reordering')}
                      </>
                    ) : (
                      t('organize_pdf.reorder_btn')
                    )}
                  </button>
                </div>
                {/* Download Button */}
                {pdfUrl && !loading && (
                  <div className="flex justify-center mt-4">
                    <a
                      href={pdfUrl}
                      download="reordered.pdf"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('organize_pdf.download_btn')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrganizePdfPage; 