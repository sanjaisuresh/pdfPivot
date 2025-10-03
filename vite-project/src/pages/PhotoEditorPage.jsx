import { useRef, useEffect, useState } from 'react';
import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import whiteTheme from '../themes/white-theme';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const PhotoEditorPage = () => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [hasImage, setHasImage] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inject custom styles to hide buttons or logo
    const style = document.createElement('style');
    style.innerHTML = `
      .tui-image-editor-download-btn {
        display: none !important;
      }
      .tui-image-editor-header-logo {
        display: none !important;
      }
      body {
        background-color: #f3f4f6 !important;
      }
      .tui-image-editor-container {
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .tui-image-editor-header {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
      }
    `;
    document.head.appendChild(style);

    // Initialize Image Editor
    editorRef.current = new ImageEditor(containerRef.current, {
      includeUI: {
        loadImage: false,
        theme: whiteTheme,
        menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'filter'],
        initMenu: '',
        uiSize: {
          width: '1000px',
          height: '700px',
        },
        menuBarPosition: 'top',
      },
      cssMaxWidth: 700,
      cssMaxHeight: 500,
      selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70,
      },
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      style.remove();
    };
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !editorRef.current) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current.loadImageFromURL(reader.result, 'NewImage').then(() => {
        editorRef.current.clearUndoStack();
        setHasImage(true);
        setError(null);
      });
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!editorRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to download edited images');
        return;
      }

      // Track usage with auth token
      await axios.post('/api/user/track', {
        service: 'photo_editor',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const dataUrl = editorRef.current.toDataURL();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'edited-image.png';
      link.click();
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        setError('Please login to continue');
      } else {
        setError(error.response?.data?.error || 'Error processing image');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600">Photo Editor</h1>
          <p className="mt-2 text-sm text-black">
            Upload an image and use our professional tools to edit it
          </p>
        </div>

        <div className="bg-[#F4EDE4]  rounded-lg shadow-lg p-6 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-6">
            <label className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upload Image</span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Editor Container */}
          <div ref={containerRef} className="rounded-lg overflow-hidden" />

          {/* Download Button */}
          {hasImage && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleDownload}
                disabled={loading}
                className={`flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Edited Image</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoEditorPage;
