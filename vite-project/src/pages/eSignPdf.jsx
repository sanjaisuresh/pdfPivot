import React, { useState, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import EditablePlacement from "../components/EditableText";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFEditor = () => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [placements, setPlacements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);

  const onFileChange = (e) => setPdfFile(e.target.files[0]);
  const onImageChange = (e) => setImageFile(e.target.files[0]);
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleAddPlacement = (type, pageIndex) => {
    const newPlacement = {
      id: uuidv4(),
      type,
      page: pageIndex,
      x: 50,
      y: 50,
      width: type === "text" ? 200 : 150,
      height: type === "text" ? 30 : 150,
      text: type === "text" ? t("pdfEditor.sampleText") : undefined,
      signatureData: type === "signature" ? canvasRef.current.toDataURL() : undefined,
    };
    setPlacements((prev) => [...prev, newPlacement]);
  };

  const startDrawing = ({ nativeEvent }) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(nativeEvent.offsetX, nativeEvent.offsetY);
    setDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(nativeEvent.offsetX, nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => setDrawing(false);
  const clearCanvas = () => canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  const handleTextChange = (id, value) => {
    setPlacements((prev) =>
      prev.map((pl) => (pl.id === id ? { ...pl, text: value } : pl))
    );
  };

  const handleSubmit = async () => {
    if (!pdfFile) return alert(t("pdfEditor.uploadPDFFirst"));
        const token = localStorage.getItem('token');
    if (!token) {
      // setLoading(false);
      alert('Login please!')
      return;
    }
    const formData = new FormData();
    formData.append("pdf", pdfFile);
    if (imageFile) formData.append("images", imageFile);
    formData.append("placements", JSON.stringify(placements));

    try {
         const trackRes = await axios.post('/api/user/track', {
        service: 'e-sign',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const res = await axios.post("/api/sign", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      document.body.appendChild(a);
      a.click();
    } catch (err) {
      console.error(err);
      alert(t("pdfEditor.failedToCreatePDF"));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">{t("pdfEditor.title")}</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1 flex flex-col gap-4">
          {/* PDF Upload */}
          <label className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-400 rounded cursor-pointer hover:border-indigo-500 transition">
            <span className="text-gray-700 font-medium">{t("pdfEditor.uploadPDF")}</span>
            <input type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />
          </label>

          {/* Image Upload */}
          <label className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-400 rounded cursor-pointer hover:border-green-500 transition">
            <span className="text-gray-700 font-medium">{t("pdfEditor.uploadImage")}</span>
            <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
          </label>

          {/* Signature Canvas */}
          <div className="mt-2 flex flex-col items-start">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="border border-gray-400 rounded mb-2"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={clearCanvas}
            >
              {t("pdfEditor.clearSignature")}
            </button>
          </div>
        </div>

        <div className="flex-1 max-h-[80vh] overflow-auto bg-white p-4 rounded shadow">
          {pdfFile && (
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (_, index) => (
                <div key={index} className="relative mb-6 border border-gray-300 rounded overflow-hidden">
                  <Page pageNumber={index + 1} width={600} />
                  {placements.filter((p) => p.page === index).map((p) => (
                    <Rnd
                      key={p.id}
                      bounds="parent"
                      size={{ width: p.width, height: p.height }}
                      position={{ x: p.x, y: p.y }}
                      onDragStop={(e, d) =>
                        setPlacements((prev) =>
                          prev.map((pl) => (pl.id === p.id ? { ...pl, x: d.x, y: d.y } : pl))
                        )
                      }
                      onResizeStop={(e, dir, ref, delta, pos) =>
                        setPlacements((prev) =>
                          prev.map((pl) =>
                            pl.id === p.id
                              ? {
                                  ...pl,
                                  x: pos.x,
                                  y: pos.y,
                                  width: parseInt(ref.style.width, 10),
                                  height: parseInt(ref.style.height, 10),
                                }
                              : pl
                          )
                        )
                      }
                      style={{
                        border: "2px dashed #3b82f6",
                        zIndex: 10,
                        background: p.type === "text" ? "#f3f4f6" : "#fff",
                        borderRadius: "4px",
                      }}
                    >
                      {p.type === "image" && imageFile && <img src={URL.createObjectURL(imageFile)} alt="img" className="w-full h-full object-contain" />}
                      {p.type === "signature" && p.signatureData && <img src={p.signatureData} alt="sig" className="w-full h-full object-contain" />}
                      {p.type === "text" && (
                   <EditablePlacement p={p} handleTextChange={handleTextChange} />
                      )}
                    </Rnd>
                  ))}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                      onClick={() => handleAddPlacement("image", index)}
                    >
                      {t("pdfEditor.placeImage")}
                    </button>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                      onClick={() => handleAddPlacement("signature", index)}
                    >
                      {t("pdfEditor.placeSignature")}
                    </button>
                    <button
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition text-sm"
                      onClick={() => handleAddPlacement("text", index)}
                    >
                      {t("pdfEditor.placeText")}
                    </button>
                  </div>
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          {t("pdfEditor.submitPDF")}
        </button>
      </div>
    </div>
  );
};

export default PDFEditor;
