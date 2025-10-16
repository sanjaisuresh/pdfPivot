import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Text, Edit2, ImageIcon } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import toast, { Toaster } from "react-hot-toast";
import MultiSelect from "../components/MultiSelect ";
import {
  FileSignature,
  Upload,
  Download,
  Trash2,
  LogOut,
  Type,
  FileText,
  Share,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useNavigate } from "react-router-dom";
import {
  GripVertical,
  X,
  Settings,
  Lock,
  Eye,
  EyeOff,
  ListOrdered,
  CalendarClock,
  Bell,
  Mail,
} from "lucide-react";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const COLORS = [
  { key: "black", code: "#000000" },
  { key: "red", code: "#FF0000" },
  { key: "blue", code: "#0057FF" },
  { key: "green", code: "#008000" },
];
const FONT_STYLES = [
  { key: "cursive", label: "Cursive", fontFamily: "'Great Vibes', cursive" },
  { key: "serif", label: "Elegant Serif", fontFamily: "'Merriweather', serif" },
  { key: "sans", label: "Modern Sans", fontFamily: "'Montserrat', sans-serif" },
  {
    key: "handwriting",
    label: "Handwriting",
    fontFamily: "'Dancing Script', cursive",
  },
  {
    key: "signature1",
    label: "Signature Style",
    fontFamily: "'Satisfy', cursive",
  },
  { key: "signature2", label: "Classic", fontFamily: "'Pacifico', cursive" },
];
const SignatureModal = ({
  isOpen,
  onClose,
  signerData,
  submitAllTabs = false,
  onSignaturesApplied,
  sharedDetails,
  editingSignature = null,
}) => {
  console.log(sharedDetails, "Got in data for sharedDetails");
  const { t } = useTranslation();

  // Determine which tabs to show based on editing mode
  const getVisibleTabs = () => {
    if (editingSignature) {
      // When editing, show only the tab for the specific signature type
      switch (editingSignature.type) {
        case "fullName":
        case "initials":
          return ["text"];
        case "freeText":
          return ["freeText"];
        case "signature":
          return ["draw"];
        case "image":
          return ["logo"];
        default:
          return ["text"];
      }
    }

    // When creating new, show all tabs based on sharedDetails
    if (sharedDetails?.user_validation?.length) {
      const validations = sharedDetails.user_validation;
      if (validations.includes("all")) {
        return ["text", "freeText", "draw", "logo"];
      } else {
        return validations;
      }
    }

    return ["text", "freeText", "draw", "logo"];
  };

  const [visibleTabs, setVisibleTabs] = useState(getVisibleTabs());
  const [activeTab, setActiveTab] = useState(
    editingSignature ? getVisibleTabs()[0] : "text"
  );

  // Initialize formData with separate styling for each tab
  const [formData, setFormData] = useState(() => {
    if (editingSignature) {
      // Pre-fill form when editing - only show data for the specific type being edited
      const baseData = {
        fullName: "",
        initials: "",
        freeText: "",
        logo: null,
        drawnSignature: null,
        uploadedSign: null,
        textStyle: {
          selectedStyle: FONT_STYLES[0].key,
          color: "#000000",
        },
        freeTextStyle: {
          selectedStyle: FONT_STYLES[0].key,
          color: "#000000",
        },
      };

      // Fill only the relevant field based on signature type
      switch (editingSignature.type) {
        case "fullName":
          baseData.fullName = editingSignature.text || "";
          baseData.textStyle = {
            selectedStyle:
              FONT_STYLES.find(
                (s) => s.fontFamily === editingSignature.fontFamily
              )?.key || FONT_STYLES[0].key,
            color: editingSignature.color || "#000000",
          };
          break;
        case "initials":
          baseData.initials = editingSignature.text || "";
          baseData.textStyle = {
            selectedStyle:
              FONT_STYLES.find(
                (s) => s.fontFamily === editingSignature.fontFamily
              )?.key || FONT_STYLES[0].key,
            color: editingSignature.color || "#000000",
          };
          break;
        case "freeText":
          baseData.freeText = editingSignature.text || "";
          baseData.freeTextStyle = {
            selectedStyle:
              FONT_STYLES.find(
                (s) => s.fontFamily === editingSignature.fontFamily
              )?.key || FONT_STYLES[0].key,
            color: editingSignature.color || "#000000",
          };
          break;
        case "signature":
          if (
            editingSignature.signatureData &&
            editingSignature.signatureData.startsWith("data:")
          ) {
            baseData.drawnSignature = editingSignature.signatureData;
          } else if (editingSignature.imageFile) {
            baseData.uploadedSign = editingSignature.imageFile;
          }
          break;
        case "image":
          baseData.logo = editingSignature.imageFile || null;
          break;
      }

      return baseData;
    }

    return {
      fullName: "",
      initials: "",
      freeText: "",
      logo: null,
      textStyle: {
        selectedStyle: FONT_STYLES[0].key,
        color: "#000000",
      },
      freeTextStyle: {
        selectedStyle: FONT_STYLES[0].key,
        color: "#000000",
      },
      drawnSignature: null,
      uploadedSign: null,
    };
  });

  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  // Update visible tabs when editingSignature changes
  useEffect(() => {
    const newVisibleTabs = getVisibleTabs();
    setVisibleTabs(newVisibleTabs);
    setActiveTab(newVisibleTabs[0]);
  }, [editingSignature]);

  // Update form data with nested structure support
  const updateFormData = (key, value, category = null) => {
    if (category && formData[category]) {
      setFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Helper to get current style based on active tab
  const getCurrentStyle = () => {
    if (activeTab === "freeText") {
      return formData.freeTextStyle;
    }
    return formData.textStyle;
  };

  // Helper to update current style
  const updateCurrentStyle = (key, value) => {
    if (activeTab === "freeText") {
      updateFormData(key, value, "freeTextStyle");
    } else {
      updateFormData(key, value, "textStyle");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) updateFormData("logo", file);
  };

  const startDrawing = ({ nativeEvent }) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(nativeEvent.offsetX, nativeEvent.offsetY);
    setDrawing(true);
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      updateFormData("drawnSignature", dataUrl);
    }
    setDrawing(false);
  };

  const clearCanvas = () =>
    canvasRef.current
      .getContext("2d")
      .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = getCurrentStyle().color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const endDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      updateFormData("drawnSignature", dataUrl);
    }
    setDrawing(false);
  };

  const handleSubmit = () => {
    const signatures = [];

    if (editingSignature) {
      // Update existing signature - use the appropriate style based on type
      const style =
        editingSignature.type === "freeText"
          ? formData.freeTextStyle
          : formData.textStyle;
      const selectedStyle = FONT_STYLES.find(
        (s) => s.key === style.selectedStyle
      );

      const updatedSignature = {
        ...editingSignature,
        fontFamily: selectedStyle?.fontFamily,
        fontStyle: style.selectedStyle,
        color: style.color,
      };

      // Update the text based on signature type
      switch (editingSignature.type) {
        case "fullName":
          updatedSignature.text = formData.fullName;
          break;
        case "initials":
          updatedSignature.text = formData.initials;
          break;
        case "freeText":
          updatedSignature.text = formData.freeText;
          break;
        case "signature":
          if (formData.drawnSignature) {
            updatedSignature.signatureData = formData.drawnSignature;
          }
          if (formData.uploadedSign) {
            updatedSignature.imageFile = formData.uploadedSign;
          }
          break;
        case "image":
          if (formData.logo) {
            updatedSignature.imageFile = formData.logo;
          }
          break;
      }

      if (onSignaturesApplied) {
        onSignaturesApplied([updatedSignature]);
      }
    } else if (submitAllTabs) {
      // Create new signatures with their respective styles
      if (formData.fullName) {
        const selectedStyle = FONT_STYLES.find(
          (s) => s.key === formData.textStyle.selectedStyle
        );
        signatures.push({
          id: `fullName-${Date.now()}`,
          type: "fullName",
          text: formData.fullName,
          fontFamily: selectedStyle?.fontFamily,
          fontStyle: formData.textStyle.selectedStyle,
          color: formData.textStyle.color,
          fontSize: 24,
          width: 200,
          height: 40,
        });
      }

      if (formData.freeText) {
        const selectedStyle = FONT_STYLES.find(
          (s) => s.key === formData.freeTextStyle.selectedStyle
        );
        signatures.push({
          id: `freeText-${Date.now()}`,
          type: "freeText",
          text: formData.freeText,
          fontFamily: selectedStyle?.fontFamily,
          fontStyle: formData.freeTextStyle.selectedStyle,
          color: formData.freeTextStyle.color,
          fontSize: 16,
          width: 200,
          height: 40,
        });
      }

      if (formData.drawnSignature) {
        signatures.push({
          id: `signature-${Date.now()}`,
          type: "signature",
          signatureData: formData.drawnSignature,
          width: 150,
          height: 80,
        });
      }

      if (formData.logo) {
        signatures.push({
          id: `logo-${Date.now()}`,
          type: "image",
          imageFile: formData.logo,
          width: 100,
          height: 100,
        });
      }

      if (formData.uploadedSign) {
        signatures.push({
          id: `uploadedSign-${Date.now()}`,
          type: "image",
          imageFile: formData.uploadedSign,
          width: 100,
          height: 100,
        });
      }

      if (formData.initials) {
        const selectedStyle = FONT_STYLES.find(
          (s) => s.key === formData.textStyle.selectedStyle
        );
        signatures.push({
          id: `initials-${Date.now()}`,
          type: "initials",
          text: formData.initials,
          fontFamily: selectedStyle?.fontFamily,
          fontStyle: formData.textStyle.selectedStyle,
          color: formData.textStyle.color,
          fontSize: 24,
          width: 200,
          height: 40,
        });
      }
    }

    // Pass signatures to parent
    if (onSignaturesApplied && signatures.length > 0) {
      onSignaturesApplied(signatures);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentStyle = getCurrentStyle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 flex">
        {/* Vertical Tabs - Only show relevant tabs */}
        {visibleTabs.length > 1 && (
          <div className="flex flex-col gap-4 mr-6">
            {visibleTabs.includes("text") && (
              <button
                className={`p-2 rounded-lg ${
                  activeTab === "text"
                    ? "bg-green-50 border border-green-500"
                    : ""
                }`}
                onClick={() => setActiveTab("text")}
              >
                <Text className="w-5 h-5" />
              </button>
            )}

            {visibleTabs.includes("freeText") && (
              <button
                className={`p-2 rounded-lg ${
                  activeTab === "freeText"
                    ? "bg-green-50 border border-green-500"
                    : ""
                }`}
                onClick={() => setActiveTab("freeText")}
              >
                <Type className="w-5 h-5" />
              </button>
            )}

            {visibleTabs.includes("draw") && (
              <button
                className={`p-2 rounded-lg ${
                  activeTab === "draw"
                    ? "bg-green-50 border border-green-500"
                    : ""
                }`}
                onClick={() => setActiveTab("draw")}
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}

            {visibleTabs.includes("logo") && (
              <button
                className={`p-2 rounded-lg ${
                  activeTab === "logo"
                    ? "bg-green-50 border border-green-500"
                    : ""
                }`}
                onClick={() => setActiveTab("logo")}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "text" && (
            <div className="space-y-4">
              {/* Only show fullName field when editing fullName or creating new */}
              {(editingSignature?.type === "fullName" || !editingSignature) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("signPDF.full_name")}
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    style={{
                      fontFamily: FONT_STYLES.find(
                        (s) => s.key === currentStyle.selectedStyle
                      )?.fontFamily,
                      color: currentStyle.color,
                    }}
                  />
                </div>
              )}

              {/* Only show initials field when editing initials or creating new */}
              {(editingSignature?.type === "initials" || !editingSignature) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("signPDF.initials")}
                  </label>
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => updateFormData("initials", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    style={{
                      fontFamily: FONT_STYLES.find(
                        (s) => s.key === currentStyle.selectedStyle
                      )?.fontFamily,
                      color: currentStyle.color,
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mt-2">
                {FONT_STYLES.map((style) => (
                  <div
                    key={style.key}
                    onClick={() =>
                      updateCurrentStyle("selectedStyle", style.key)
                    }
                    className={`border rounded-md p-2 text-center cursor-pointer ${
                      currentStyle.selectedStyle === style.key
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: "24px",
                      color: currentStyle.color,
                    }}
                  >
                    {editingSignature?.type === "initials"
                      ? formData.initials || t("signPDF.initials")
                      : formData.fullName || t("signPDF.full_name")}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => updateCurrentStyle("color", c.code)}
                    className={`w-7 h-7 rounded-full border-2 ${
                      currentStyle.color === c.code
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: c.code }}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "freeText" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("signPDF.free_text")}
                </label>
                <input
                  type="text"
                  value={formData.freeText}
                  onChange={(e) => updateFormData("freeText", e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  style={{
                    fontFamily: FONT_STYLES.find(
                      (s) => s.key === currentStyle.selectedStyle
                    )?.fontFamily,
                    color: currentStyle.color,
                  }}
                  placeholder={t("signPDF.free_text_placeholder")}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {FONT_STYLES.map((style) => (
                  <div
                    key={style.key}
                    onClick={() =>
                      updateCurrentStyle("selectedStyle", style.key)
                    }
                    className={`border rounded-md p-2 text-center cursor-pointer ${
                      currentStyle.selectedStyle === style.key
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: "16px",
                      color: currentStyle.color,
                    }}
                  >
                    {formData.freeText || t("signPDF.free_text_sample")}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => updateCurrentStyle("color", c.code)}
                    className={`w-7 h-7 rounded-full border-2 ${
                      currentStyle.color === c.code
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: c.code }}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* Draw and Logo tabs remain similar but with conditional rendering */}
          {activeTab === "draw" && (
            <div className="mt-2 grid grid-rows-2 gap-4">
              {/* Drawing canvas */}
              <div
                className="border rounded-md p-2 flex flex-col items-center relative"
                style={{ maxHeight: "200px" }}
              >
                <div className="mt-2 flex flex-col items-start relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={140}
                    className="border border-gray-400 rounded mb-2"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <button
                    onClick={clearCanvas}
                    className="absolute top-0 right-0 bg-white p-1 rounded-full shadow hover:bg-gray-100 transition"
                    title="Clear signature"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Upload signature image */}
              <div
                className="border rounded-md p-2 flex flex-col items-center"
                style={{ maxHeight: "200px" }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("signPDF.drawnSign")}
                </label>
                <div className="flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 w-full h-full">
                  <div className="space-y-1 text-center w-full overflow-auto">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload-signature"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold"
                      >
                        <span>{t("signPDF.upload_btn")}</span>
                        <input
                          id="file-upload-signature"
                          name="file-upload-signature"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateFormData("uploadedSign", e.target.files[0])
                          }
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("image_up_to_5mb")}
                    </p>
                    {formData.uploadedSign && (
                      <img
                        src={URL.createObjectURL(formData.uploadedSign)}
                        alt="Signature Preview"
                        className="h-16 mt-2 mx-auto rounded-md border"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logo" && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("signPDF.companyLogo")}
              </label>
              <div className="mt-1 flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-10 w-10 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload-logo"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold"
                    >
                      <span>{t("signPDF.upload_btn")}</span>
                      <input
                        id="file-upload-logo"
                        name="file-upload-logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("image_up_to_5mb")}
                  </p>
                  {formData.logo && (
                    <img
                      src={URL.createObjectURL(formData.logo)}
                      alt="Logo Preview"
                      className="h-16 mt-2 mx-auto rounded-md border"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t("signPDF.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-forest text-white rounded-lg hover:bg-gold hover:text-forest"
            >
              {editingSignature ? t("signPDF.update") : t("signPDF.submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// Editable Placement Component
const EditablePlacement = ({ placement, onTextChange }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(placement.isEditing || false);
  const [text, setText] = useState(placement.text || "");

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTextChange(placement.id, text);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center p-1 cursor-text"
      onDoubleClick={handleDoubleClick}
      style={{
        fontFamily: placement.fontFamily,
        color: placement.color,
        fontSize: `${placement.fontSize || 16}px`,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "4px",
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          className="w-full h-full border-none bg-transparent text-center outline-none"
          style={{
            fontFamily: placement.fontFamily,
            color: placement.color,
            fontSize: `${placement.fontSize || 16}px`,
          }}
          autoFocus
          placeholder={t("signPDF.type_here")}
        />
      ) : (
        <span className={!text ? "text-gray-400 italic" : ""}>
          {text || t("signPDF.double_click_to_edit")}
        </span>
      )}
    </div>
  );
};
const roles = ["signer", "viewer", "validator", "witness"];
const signFormats = ["text", "draw", "uploadedSign", "freeText"];
const globalSettingsConfig = [
  {
    type: "checkbox",
    key: "reorder",
    labelKey: "order_receivers_label",
    descKey: "order_receivers_desc",
    icon: ListOrdered,
  },
  {
    type: "checkbox",
    key: "expireDate",
    labelKey: "expire_date_label",
    descKey: "expire_date_desc",
    icon: CalendarClock,
  },
  {
    type: "checkbox",
    key: "emailNotifications",
    labelKey: "email_notifications_label",
    descKey: "email_notifications_desc",
    icon: Mail,
    defaultChecked: true, // default checked
  },
  {
    type: "checkbox",
    key: "reminder",
    labelKey: "reminder_label",
    descKey: "reminder_desc",
    icon: Bell,
    defaultChecked: true, // default checked
  },
];
const ShareModal = ({
  isOpen,
  onClose,
  allowReorder = true,
  onSubmit,
  shareLoading,
  onRecipientsSaved,
}) => {
  const { t } = useTranslation();
  const [recipients, setRecipients] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [activeSettingsId, setActiveSettingsId] = useState(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(true);
  const [settingsSet, setSettingsSet] = useState([]);
  const [errors, setErrors] = useState({});
  const [applyToAll, setApplyToAll] = useState(false);

  useEffect(() => {
    if (applyToAll && activeSettingsId) {
      const activeRecipient = recipients.find((r) => r.id === activeSettingsId);
      if (!activeRecipient) return;

      // Apply same password and format to all (one-time sync)
      setRecipients((prev) =>
        prev.map((r) => ({
          ...r,
          password: activeRecipient.password,
          allowedFormats: activeRecipient.allowedFormats,
        }))
      );
    } else if (!applyToAll) {
      // Only reset once when toggled off
      setRecipients((prev) =>
        prev.map((r) => ({
          ...r,
          password: "",
          allowedFormats: [],
        }))
      );
    }
  }, [applyToAll, activeSettingsId]);

  const resetModal = () => {
    setRecipients([]);
    setDraggingIndex(null);
    setActiveSettingsId(null);
    setErrors({});
    const defaults = globalSettingsConfig
      .filter((s) => defaultCheckedKeys.includes(s.key))
      .map((s) => ({ key: s.key, value: s.key === "reminder" ? "1" : "" }));
    setSettingsSet(defaults);
    setShowGlobalSettings(true);
  };
  useEffect(() => {
    // If there are recipients and no one is active, open the first one
    if (recipients.length > 0 && !activeSettingsId) {
      setActiveSettingsId(recipients[0].id);
    }
  }, [recipients]);
  useEffect(() => {
    if (isOpen && recipients.length === 0) {
      const defaultRecipient = {
        id: Date.now(),
        name: "",
        email: "",
        role: "signer",
        password: "",
        allowedFormats: [],
      };
      setRecipients([defaultRecipient]);
      setActiveSettingsId(defaultRecipient.id); // Auto open its settings
    }
  }, [isOpen]);

  // Array of keys that should be default checked
  const defaultCheckedKeys = ["emailNotifications", "reminder"]; // default checked keys
  const GlobalNumberSetting = ({
    settingKey,
    label,
    descriptionTemplate,
    defaultValue,
  }) => {
    const checked = isGlobalChecked(settingKey);
    const settingValue =
      settingsSet.find((s) => s.key === settingKey)?.value || defaultValue;
    if (!checked) return null;
    return (
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{label}</span>
          <input
            type="number"
            min="1"
            value={settingValue}
            onChange={(e) =>
              handleChangeGlobalValue(settingKey, e.target.value)
            }
            className="w-16 border rounded px-2 py-1 text-sm"
          />
          <span className="text-sm text-gray-700">days</span>
        </div>
        <p className="text-xs text-gray-600">
          {t(descriptionTemplate, { days: settingValue })}
        </p>
      </div>
    );
  };
  useEffect(() => {
    const defaults = globalSettingsConfig
      .filter((s) => defaultCheckedKeys.includes(s.key))
      .map((s) => ({ key: s.key, value: s.key === "reminder" ? "1" : "" }));
    setSettingsSet(defaults); // overwrite, not append
  }, []);
  const handleAddRecipient = () => {
    setRecipients((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        email: "",
        role: "signer",
        password: "",
        allowedFormats: [],
      },
    ]);
  };

  const handleRemove = (id) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };
  const toggleSettings = (id) => {
    setActiveSettingsId(activeSettingsId === id ? null : id);
  };
  // Drag & Drop
  const handleDragStart = (index) => {
    if (!allowReorder) return;
    setDraggingIndex(index);
  };
  const handleDragOver = (index) => {
    if (!allowReorder || draggingIndex === null || draggingIndex === index)
      return;
    const updated = [...recipients];
    const [dragged] = updated.splice(draggingIndex, 1);
    updated.splice(index, 0, dragged);
    setRecipients(updated);
    setDraggingIndex(index);
  };
  const handleDragEnd = () => setDraggingIndex(null);

  const validateRecipients = () => {
    let valid = true;
    const newErrors = {};

    recipients.forEach((r) => {
      const recErrors = {};
      // Check required fields
      if (!r.name?.trim()) {
        recErrors.name = t("signPDF.name_required");
        valid = false;
      }
      if (!r.email?.trim()) {
        recErrors.email = t("signPDF.email_required");
        valid = false;
      } else {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(r.email)) {
          recErrors.email = t("signPDF.invalid_email");
          valid = false;
        }
      }
      if (Object.keys(recErrors).length) newErrors[r.id] = recErrors;
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateRecipients()) {
      toast.error(t("signPDF.receipt_error"));
      return;
    }

    try {
      // Call the new callback instead of directly submitting
      if (onRecipientsSaved) {
        onRecipientsSaved({recipients, settingsSet});
        onClose();
      }
    } catch (err) {
      toast.error(t("signPDF.share_failed"));
      console.error(err);
    }
  };

  const handleChange = (id, field, value) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

    // Clear error for this field as user types
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const { [field]: removed, ...rest } = prev[id];
      return { ...prev, [id]: rest };
    });
  };

  const handleToggleGlobal = (key) => {
    setSettingsSet((prev) => {
      const exists = prev.find((s) => s.key === key);
      if (exists) {
        return prev.filter((s) => s.key !== key);
      } else {
        const defaultValue =
          key === "expireDate" ? "15" : key === "reminder" ? "1" : "";
        // Ensure no duplicate for same key
        return [
          ...prev.filter((s) => s.key !== key),
          { key, value: defaultValue },
        ];
      }
    });
  };
  const handleChangeGlobalValue = (key, newValue) => {
    setSettingsSet((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
    );
  };
  const isGlobalChecked = (key) => settingsSet.some((s) => s.key === key);
  const [showPassword, setShowPassword] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh] flex gap-4">
        <X
          size={22}
          className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-gray-700 transition"
          onClick={onClose}
        />
        {/* Left side: ShareModal content */}
        <div
          className={`flex-1 flex flex-col gap-3 max-h-[600px] overflow-y-auto overflow-x-auto pr-2`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("signPDF.share_title")}
            </h2>
            <Settings
              className="text-gray-500 cursor-pointer"
              size={20}
              onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            />
          </div>

          <div className="max-h-[500px] overflow-x-auto">
            {recipients.map((r, idx) => (
              <div
                key={r.id}
                className={`flex flex-col gap-1 p-3 mb-2 border rounded-lg transition-colors
    ${draggingIndex === idx ? "bg-yellow-100" : ""}
    ${activeSettingsId === r.id ? "bg-blue-50 border-blue-400" : "bg-white"}
  `}
                draggable={allowReorder}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={() => handleDragOver(idx)}
                onDragEnd={handleDragEnd}
                style={{ cursor: allowReorder ? "grab" : "default" }}
              >
                <div className="flex items-center gap-2">
                  {/* Drag handle */}
                  <GripVertical
                    className="text-gray-500 cursor-grab"
                    size={20}
                    onMouseDown={(e) => e.preventDefault()}
                  />

                  <input
                    type="text"
                    placeholder={t("signPDF.recipient_name")}
                    value={r.name}
                    onChange={(e) => handleChange(r.id, "name", e.target.value)}
                    className={`w-24 border p-2 rounded ${
                      errors[r.id]?.name ? "border-red-500" : ""
                    }`}
                  />
                  <input
                    type="email"
                    placeholder={t("signPDF.recipient_email")}
                    value={r.email}
                    onChange={(e) =>
                      handleChange(r.id, "email", e.target.value)
                    }
                    className={`flex-1 border p-2 rounded ${
                      errors[r.id]?.email ? "border-red-500" : ""
                    }`}
                  />
                  <select
                    value={r.role}
                    onChange={(e) => handleChange(r.id, "role", e.target.value)}
                    className="border p-2 rounded"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {t(`signPDF.role_${role}`)}
                      </option>
                    ))}
                  </select>

                  {/* Remove recipient */}
                  <X
                    className="text-gray-500 cursor-pointer"
                    size={18}
                    onClick={() => handleRemove(r.id)}
                  />

                  {/* Settings icon */}
                  <Settings
                    className="text-gray-500 cursor-pointer"
                    size={18}
                    onClick={() => toggleSettings(r.id)}
                  />
                </div>

                {/* Field-specific errors */}
                {/* <div className="flex flex-col gap-1">
                {errors[r.id]?.name && (
                  <span className="text-red-500 text-xs">
                    {errors[r.id].name}
                  </span>
                )}
                {errors[r.id]?.email && (
                  <span className="text-red-500 text-xs">
                    {errors[r.id].email}
                  </span>
                )}
              </div> */}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRecipient}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            + {t("signPDF.add_recipient")}
          </button>
          <div className="mt-6 flex justify-end gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="applyAllToggle"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                {t("signPDF.apply_all")}
              </label>
              <input
                type="checkbox"
                id="applyAllToggle"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
            >
              {t("signPDF.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-forest text-white rounded"
              disabled={shareLoading}
            >
              {shareLoading ? t("signPDF.sharing") : t("signPDF.save_continue")}
            </button>
          </div>
        </div>
        {/* Right side: Global Settings */}
        {showGlobalSettings && (
          <div className="w-80 border-l border-gray-200 pl-4 max-h-[600px] overflow-y-auto mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                {t("signPDF.receiptHeader")}
              </h3>
            </div>

            {recipients.map(
              (r) =>
                activeSettingsId === r.id && (
                  <>
                    <div
                      key={`settings-${r.id}`}
                      className="border p-3 rounded-lg bg-gray-50 flex flex-col gap-3"
                    >
                      <label className="text-gray-700 text-sm font-medium">
                        {t("signPDF.password_protect")}
                      </label>
                      <div className="relative w-full">
                        <Lock
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500"
                          size={18}
                        />
                        <input
                          type={r.showPassword ? "text" : "password"}
                          placeholder={t("signPDF.password_protect")}
                          value={r.password || ""}
                          onChange={(e) =>
                            handleChange(r.id, "password", e.target.value)
                          }
                          className="w-full pl-8 pr-8 border p-2 rounded"
                        />
                        <div
                          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={() =>
                            handleChange(r.id, "showPassword", !r.showPassword)
                          }
                        >
                          {r.showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </div>
                      </div>
                      <label className="text-gray-700 text-sm font-medium">
                        {t("signPDF.allowedSignFormat")}
                      </label>
                      <MultiSelect
                        options={signFormats.map((f) => ({
                          value: f,
                          label: t(`signPDF.signFormat${f}`),
                        }))}
                        value={r.allowedFormats.map((f) => ({
                          value: f,
                          label: t(`signPDF.signFormat${f}`),
                        }))}
                        onChange={(selected) =>
                          handleChange(
                            r.id,
                            "allowedFormats",
                            selected.map((s) => s.value)
                          )
                        }
                        placeholder={t("signPDF.select_formats")}
                        isMultiSelect={true}
                        isClearable={true}
                        className="w-full"
                      />
                    </div>
                  </>
                )
            )}
            <div className="mt-2">
              <h3 className="font-semibold text-gray-900 mb-3">
                {t("signPDF.global_settings")}
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                {t("signPDF.global_setting_desc")}
              </p>
              <div className="space-y-4">
                {globalSettingsConfig.map((setting) => {
                  const Icon = setting.icon;
                  const checked = isGlobalChecked(setting.key);
                  return (
                    <div
                      key={setting.key}
                      className="flex items-start gap-3 border p-3 rounded-lg"
                    >
                      {/* Checkbox */}
                      {setting.type === "checkbox" && (
                        <input
                          type="checkbox"
                          id={setting.key}
                          checked={checked}
                          onChange={() => handleToggleGlobal(setting.key)}
                          className="mt-1 h-4 w-4 cursor-pointer"
                        />
                      )}
                      {/* Icon */}
                      {Icon && (
                        <div className="mt-0.5 text-gray-700">
                          <Icon size={18} />
                        </div>
                      )}
                      <div className="flex flex-col flex-1">
                        <label
                          htmlFor={setting.key}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {t(`signPDF.${setting.labelKey}`)}
                        </label>
                        {/* Normal description */}
                        {setting.descKey &&
                          !["expireDate", "reminder"].includes(setting.key) && (
                            <p className="text-xs text-gray-600">
                              {t(`signPDF.${setting.descKey}`)}
                            </p>
                          )}
                        {/* Reusable number settings */}
                        {setting.key === "expireDate" && (
                          <GlobalNumberSetting
                            settingKey="expireDate"
                            label={t("signPDF.expires_in_days")}
                            descriptionTemplate="signPDF.expires_in"
                            defaultValue="15"
                          />
                        )}
                        {setting.key === "reminder" && (
                          <GlobalNumberSetting
                            settingKey="reminder"
                            label="Every"
                            descriptionTemplate="signPDF.reminder_desc"
                            defaultValue="1"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowGlobalSettings(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
              >
                {t("signPDF.cancel")}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => }
              >
                {t("signPDF.save_continue")}
              </button>
            </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ViewInfoModal Component
const ViewInfoModal = ({ isOpen, onClose, fileInfo, loading }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("signPDF.file_information")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
              <span className="ml-2 text-gray-600">{t("signPDF.loading")}</span>
            </div>
          ) : fileInfo && fileInfo.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("signPDF.document_name")}
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("signPDF.signed_file_path")}
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("signPDF.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("signPDF.user_name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("signPDF.created_date")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("signPDF.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fileInfo.map((info, index) => (
                    <tr key={info._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {info.file_name || "Untitled Document"}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {info.signed_file_path || "--"}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            info.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : info.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : info.status === "signed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {info.status
                            ? t(`signPDF.status_${info.status}`)
                            : "--"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {info.user_name || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {info.createdAt
                          ? new Date(info.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() =>
                                    info.signed_file_path &&
                                    handleDownloadSignedFile(info)
                                  }
                                  disabled={!info.signed_file_path}
                                  className={`transition duration-200 p-1 rounded hover:bg-gray-100 ${
                                    info.signed_file_path
                                      ? "text-forest hover:text-gold cursor-pointer"
                                      : "text-gray-400 opacity-60 cursor-not-allowed"
                                  }`}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {info.signed_file_path
                                  ? t("signPDF.download_signed_document")
                                  : t("signPDF.no_signed_document")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("signPDF.no_file_info")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("signPDF.no_file_info_desc")}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            {t("signPDF.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignRecipientModal = ({
  isOpen,
  onClose,
  placement,
  recipients = [], // Add default value
  currentAssignment,
  onAssign,
}) => {
  const { t } = useTranslation();
  const [selectedRecipient, setSelectedRecipient] = useState(
    currentAssignment || ""
  );

  const handleSubmit = () => {
    if (selectedRecipient && onAssign) {
      onAssign(placement.id, selectedRecipient);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("signPDF.assign_recipient")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {t("signPDF.assign_recipient_desc")}
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("signPDF.select_recipient")}
          </label>
          <select
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="">{t("signPDF.select_recipient")}</option>
            {recipients
              .filter((recipient) => recipient.role === "signer")
              .map((recipient) => (
                <option key={recipient.id} value={recipient.email}>
                  {recipient.name} ({recipient.email})
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            {t("signPDF.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRecipient}
            className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-gold hover:text-forest disabled:opacity-50"
          >
            {t("signPDF.assign")}
          </button>
        </div>
      </div>
    </div>
  );
};
const SignPDF = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitAllTabs, setSubmitAllTabs] = useState(true);
  // modal states
  const [typeModal, setTypeModal] = useState(false);
  const [signatureModal, setSignatureModal] = useState(false);
  const [typeState, setTypeState] = useState("self");
  const [step, setStep] = useState(1);
  // PDF preview states
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedSignatures, setAppliedSignatures] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [hasShareReq, sethasShareReq] = useState(false);
  const [sharedDetails, setSharedDetails] = useState({});
  const hasFetchedRef = useRef(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [placementRecipients, setPlacementRecipients] = useState([]);
  const [assignRecipientModal, setAssignRecipientModal] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState(null);
  const [placementAssignments, setPlacementAssignments] = useState({});
  const handleEditSignature = (signature) => {
    setEditingSignature(signature);
    setSignatureModal(true);
  };

  // Update handleSignaturesApplied to handle updates correctly
  const handleSignaturesApplied = (signatures) => {
    if (editingSignature) {
      // Update existing signature by ID
      setAppliedSignatures((prev) =>
        prev.map((sig) =>
          sig.id === editingSignature.id ? { ...sig, ...signatures[0] } : sig
        )
      );
      setEditingSignature(null);
    } else {
      // Add new signatures
      setAppliedSignatures((prev) => [...prev, ...signatures]);
      setShowPreview(true);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (hasFetchedRef.current) return; // prevent duplicate fetch
    hasFetchedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("file_id");
    if (shareId) handleShareId(shareId);
  }, []);
  const handleShareId = async (id) => {
    console.log("Share ID from URL:", id);
    sethasShareReq(true);
    try {
      const response = await getSharedDetails(id);
    } catch (error) {
      console.error("Error loading shared file:", error);
    } // Here you can make API calls or handle it as needed
  };
  const getSharedDetails = async (shared_id) => {
    try {
      const response = await axios.get(`/api/esign/share/docs/info`, {
        params: { shared_id },
        headers: { "Content-Type": "application/json" },
      });
      const data = response?.data?.data;
      console.log(data, "Got in data for set");

      setSharedDetails(data ?? {});
      await getFileShared(data); // ✅ pass directly here
    } catch (error) {
      toast.error(t("signPDF.share_failed"));
      throw error;
    }
  };

  const getFileShared = async (sharedData) => {
    const file_path = sharedData?.original_file_path; // ✅ use from argument
    console.log(file_path, "Got in data for download");

    try {
      const response = await axios.post(
        `/api/esign/docs/download`,
        { file_path },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        }
      );

      const fileName = file_path.split("/").pop();
      const file = new File([response.data], fileName, {
        type: "application/pdf",
      });

      setFiles([file]);
      setError(null);
    } catch (error) {
      setError(t("signPDF.shareFileError"));
    }
  };

  const handleShareSubmit = async (shareData) => {
    const { recipients, globalSettings } = shareData;
    console.log(recipients,shareData,"Got in data for receiptent")
    // Store recipients for later assignment
    setPlacementRecipients(recipients);

    // Upload file first
    const resUpload = await uploadFile();
    if (!resUpload?.data?.data?.file_path) {
      toast.error(t("signPDF.upload_failed"));
      return;
    }

    // Store the file info for final submission
    setSharedDetails((prev) => ({
      ...prev,
      file_path: resUpload.data.data.file_path,
      file_name: resUpload.data.data.file_name,
      recipients,
      globalSettings,
    }));

    // Close share modal and show preview
    setShareModal(false);
    setShowPreview(true);
    toast.success(t("signPDF.recipients_saved"));
  };
  // Open assignment modal
  const handleOpenAssignModal = (placement) => {
    setCurrentPlacement(placement);
    setAssignRecipientModal(true);
  };
  const handleAssignRecipient = (placementId, recipientEmail) => {
    setPlacementAssignments((prev) => ({
      ...prev,
      [placementId]: recipientEmail,
    }));

    // Also update the placement in appliedSignatures
    setAppliedSignatures((prev) =>
      prev.map((sig) => ({
        ...sig,
        placements:
          sig.placements?.map((pl) =>
            pl.id === placementId ? { ...pl, assignedTo: recipientEmail } : pl
          ) || [],
      }))
    );

    toast.success(t("signPDF.recipient_assigned"));
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Merriweather&family=Montserrat&family=Dancing+Script&family=Satisfy&family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  const handleContinue = () => {
    if (files.length === 0) return;
    setTypeModal(true);
  };
  const handleSelfSubmit = () => {
    setTypeModal(false);
    setSignatureModal(true);
  };
  // Handle file input
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf"
    );

    if (newFiles.length === 0) {
      setError(t("signPDF.signPdf_error"));
      return;
    }

    // keep latest file
    const fileToUpload = newFiles[0];
    setFiles([fileToUpload]);
    setError(null);
  };

  const uploadFile = async () => {
    if (!files || files.length === 0) {
      toast.error(t("signPDF.no_file_selected"));
      return;
    }

    const fileToUpload = files[0];
    const formData = new FormData();
    formData.append("pdf-file", fileToUpload);

    try {
      const response = await axios.post("/api/esign/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.status === "success") {
        const data = response.data;
        setError(null);
      }
      return response;
    } catch (err) {
      toast.error("Sign in to share file");
    }
  };

  // Remove file
  const handleRemove = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  // Drag and drop reordering
  const handleDragStart = (idx) => {
    setFiles((files) => files.map((f, i) => ({ ...f, _dragging: i === idx })));
  };
  const handleDragOver = (idx) => {
    const draggingIdx = files.findIndex((f) => f._dragging);
    if (draggingIdx === -1 || draggingIdx === idx) return;
    const reordered = [...files];
    const [dragged] = reordered.splice(draggingIdx, 1);
    reordered.splice(idx, 0, dragged);
    setFiles(reordered.map((f) => ({ ...f, _dragging: false })));
  };
  const handleDragEnd = () => {
    setFiles((files) => files.map((f) => ({ ...f, _dragging: false })));
  };
  const handleSeveralSubmit = () => {
    setTypeModal(false);
    setShareModal(true);
    setTypeState("several");
  };

  // Add placement to PDF
  const handleAddPlacement = (signatureId, pageIndex) => {
    const signature = appliedSignatures.find((sig) => sig.id === signatureId);
    if (!signature) return;

    const newPlacement = {
      id: `${signature.type}-${Date.now()}`,
      type: signature.type,
      page: pageIndex,
      x: 50,
      y: 50,
      width: signature.width,
      height: signature.height,
      text: signature.text || "", // Use signature text for text-based types
      fontFamily: signature.fontFamily,
      color: signature.color,
      fontSize: signature.fontSize,
      signatureData:
        signature.type === "signature" ? signature.signatureData : undefined,
      imageFile: signature.type === "image" ? signature.imageFile : undefined,
      // For uploaded signatures, also include the imageFile
      ...(signature.type === "signature" &&
        signature.isUploaded && {
          imageFile: signature.imageFile,
        }),
    };

    setAppliedSignatures((prev) =>
      prev.map((sig) =>
        sig.id === signatureId
          ? { ...sig, placements: [...(sig.placements || []), newPlacement] }
          : sig
      )
    );
  };
  // Handle text change in placements
  const handleTextChange = (id, value) => {
    setAppliedSignatures((prev) =>
      prev.map((sig) => ({
        ...sig,
        placements:
          sig.placements?.map((pl) =>
            pl.id === id ? { ...pl, text: value, isEditing: false } : pl
          ) || [],
      }))
    );
  };
  // Handle placement movement and resize
  const handlePlacementUpdate = (id, updates) => {
    setAppliedSignatures((prev) =>
      prev.map((sig) => ({
        ...sig,
        placements:
          sig.placements?.map((pl) =>
            pl.id === id ? { ...pl, ...updates } : pl
          ) || [],
      }))
    );
  };

  // Remove placement
  const handleRemovePlacement = (id) => {
    setAppliedSignatures((prev) =>
      prev.map((sig) => ({
        ...sig,
        placements: sig.placements?.filter((pl) => pl.id !== id) || [],
      }))
    );
  };
  const handleFinalSubmit = async (isUploadSign) => {
    if (!files[0]) return alert(t("signPDF.uploadPDFFirst"));
    const token = localStorage.getItem("token");
    if (isUploadSign === false) {
      setLoading(true);
    }
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);

      // Add all placements with complete styling information
      const allPlacements = appliedSignatures.flatMap(
        (sig) => sig.placements || []
      );

      const placementsWithStyles = allPlacements.map((placement) => ({
        ...placement,
        fontFamily: placement.fontFamily || FONT_STYLES[0].fontfamily,
        color: placement.color || "#000000",
        fontSize: placement.fontSize || 24,
        imageFileName: placement.imageFile ? placement.imageFile.name : null,
      }));

      formData.append("placements", JSON.stringify(placementsWithStyles));

      // Add image files - FIXED: Use placement ID as fieldname
      appliedSignatures.forEach((sig) => {
        if (
          (sig.type === "image" || sig.type === "signature") &&
          sig.imageFile
        ) {
          const placementId = sig.placements?.[0]?.id || sig.id;
          if (placementId) {
            // Use placement ID as the fieldname, not "images"
            formData.append(placementId, sig.imageFile);
            console.log(
              `Added image with fieldname: ${placementId}, filename: ${sig.imageFile.name}, size: ${sig.imageFile.size} bytes`
            );
          }
        }
      });
      // Handle drawn signatures - FIXED: Properly convert data URL to file
      const imagePromises = [];
      appliedSignatures.forEach((sig) => {
        if (
          sig.type === "signature" &&
          sig.signatureData &&
          sig.signatureData.startsWith("data:") &&
          !sig.imageFile
        ) {
          const promise = (async () => {
            try {
              const placementId = sig.placements?.[0]?.id || sig.id;
              // Convert data URL to blob and then to file
              const response = await fetch(sig.signatureData);
              const blob = await response.blob();

              // Create file with proper binary data
              const file = new File([blob], `signature-${placementId}.png`, {
                type: "image/png",
              });

              formData.append("signatures", file, placementId);
              console.log(
                `Added drawn signature with fieldname: ${placementId}, size: ${file.size} bytes`
              );
            } catch (error) {
              console.error("Error processing signature:", error);
            }
          })();
          imagePromises.push(promise);
        }
      });

      await Promise.all(imagePromises);

      // Log form data contents for debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log("Sending placements:", placementsWithStyles);

      // Submit for signing
      const res = await axios.post("/api/sign-PDF", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 60000,
      });

      // If user wants to upload the signed PDF instead of downloading
      if (isUploadSign === true) {
        console.log("Uploading signed file instead of downloading...");
        const signedFile = new File([res.data], "signed-document.pdf", {
          type: "application/pdf",
        });
        console.log(sharedDetails, "Got in data for sharedDetails");
        const uploadFormData = new FormData();
        uploadFormData.append("pdf-file", signedFile);
        uploadFormData.append("file_id", sharedDetails?._id ?? "");
        await uploadFileSigned(uploadFormData, token);
        alert("Signed PDF successfully uploaded!");
        return;
      } else {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = "signed-document.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error creating signed PDF:", err);
      alert(t("signPDF.failed_to_create"));
    } finally {
      setLoading(false);
    }
  };
  const uploadFileSigned = async (formData, token) => {
    try {
      const response = await axios.post("/api/esign/upload/signed", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading signed PDF:", error);
      toast.error(error?.data?.data?.message ?? "PDF already signed");
    }
  };

  // Clear everything and reset to initial state
  const handleClearAll = () => {
    setFiles([]);
    setAppliedSignatures([]);
    setShowPreview(false);
    setCurrentPage(1);
    setNumPages(0);
    setError(null);
    setTypeModal(false);
    setSignatureModal(false);
    setTypeState("self");
    sethasShareReq(false);
  };

  const handleReloadPage = () => {
    // If the current URL includes a file_id query, remove it
    navigate("/sign-pdf", { replace: true });
    handleClearAll();
    // Optionally reload the page if you want a hard reload
    // window.location.href = "/sign-pdf";
  };

  const handleAddFreeText = (pageIndex) => {
    const newFreeTextId = `free-text-${Date.now()}`;

    // Create the signature object first
    const newFreeTextSignature = {
      id: newFreeTextId,
      type: "freeText",
      text: "Free Text", // Default text when creating new free text
      fontFamily: FONT_STYLES[0].fontFamily,
      color: "#000000",
      fontSize: 16,
      placements: [], // Start with empty placements
    };

    // Create the placement with the same text
    const newFreeTextPlacement = {
      id: `${newFreeTextId}-placement`,
      type: "freeText",
      page: pageIndex,
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      text: "Free Text", // Set initial text here
      fontFamily: FONT_STYLES[0].fontFamily,
      color: "#000000",
      fontSize: 16,
      isEditing: true, // Start in editing mode
    };

    // Add the placement to the signature
    newFreeTextSignature.placements = [newFreeTextPlacement];

    setAppliedSignatures((prev) => [...prev, newFreeTextSignature]);
  };

  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch document history
  useEffect(() => {
    const fetchDocumentHistory = async () => {
      setHistoryLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/esign/owner-docs/list", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data?.status === "success") {
          setHistoryData(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching document history:", error);
        toast.error(t("signPDF.history_fetch_error"));
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchDocumentHistory();
  }, [t]);

  const [viewInfoModal, setViewInfoModal] = useState(false);
  const [viewInfoData, setviewInfoData] = useState(null);
  const [fileInfoLoading, setFileInfoLoading] = useState(false);

  const handleViewHistoryDoc = async (doc) => {
    setFileInfoLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/esign/owner-docs/file-info", {
        params: { file_id: doc._id },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.status === "success") {
        setviewInfoData(response.data.data);
        setViewInfoModal(true);
      } else {
        toast.error(t("signPDF.file_info_error"));
      }
    } catch (error) {
      console.error("Error fetching file info:", error);
      toast.error(t("signPDF.file_info_error"));
    } finally {
      setFileInfoLoading(false);
    }
  };

  const handleFinalShare = async () => {
    if (!sharedDetails.file_path) {
      toast.error(t("signPDF.file_not_uploaded"));
      return;
    }

    // Prepare placements with assignments
    const placementsWithAssignments = appliedSignatures.flatMap(
      (sig) =>
        sig.placements?.map((placement) => ({
          ...placement,
          assignedTo: placementAssignments[placement.id] || "",
          // Include styling info
          fontFamily: placement.fontFamily,
          color: placement.color,
          fontSize: placement.fontSize,
          imageFileName: placement.imageFile ? placement.imageFile.name : null,
        })) || []
    );

    // Check if all placements are assigned
    const unassignedPlacements = placementsWithAssignments.filter(
      (placement) => !placement.assignedTo
    );

    if (unassignedPlacements.length > 0) {
      toast.error(t("signPDF.assign_all_placements"));
      return;
    }

    const payload = {
      file_path: sharedDetails.file_path,
      file_name: sharedDetails.file_name,
      shared_users: sharedDetails.recipients.map((user) => ({
        user_name: user.name,
        user_email: user.email,
        user_validation: user.allowedFormats,
        user_password: user.password || "",
        user_role: user.role,
      })),
      settings: sharedDetails.globalSettings,
      placements: placementsWithAssignments,
    };

    try {
      setShareLoading(true);
      const response = await axios.post("/api/esign/share", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data?.status === "success") {
        toast.success(t("signPDF.share_success"));
        handleClearAll();
      } else {
        toast.error(t("signPDF.share_failed"));
      }
    } catch (err) {
      console.error("Share error:", err);
      toast.error(t("signPDF.share_failed"));
    } finally {
      setShareLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>{t("signPDF.title")} | PDFPivot</title>
        <meta name="description" content={t("signPDF.desc")} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t("signPDF.title")} />
        <meta property="og:description" content={t("signPDF.desc")} />
        <meta property="og:url" content="https://www.pdfpivot.com/sign-PDF" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={t("signPDF.title")} />
        <meta name="twitter:description" content={t("signPDF.desc")} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-forest mb-2">
              {t("signPDF.title")}
            </h1>
            <p className="text-lg text-black max-w-2xl mx-auto">
              {t("signPDF.desc")}
            </p>
          </div>
          <div
            className={`${
              showPreview
                ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
                : "max-w-3xl mx-auto"
            }`}
          >
            {/* Left Column - Upload and Controls */}
            <div
              className={`bg-[#F4EDE4] rounded-xl shadow-lg overflow-hidden ${
                showPreview ? "" : "max-w-3xl mx-auto"
              }`}
            >
              <div className="p-6">
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* File Upload */}
                  {!showPreview && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("signPDF.upload_pdfs")}
                      </label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => e.preventDefault()}
                        onDragLeave={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (hasShareReq) return; // disable when sharing
                          const files = Array.from(e.dataTransfer.files);
                          const pdfFiles = files.filter(
                            (file) => file.type === "application/pdf"
                          );
                          if (pdfFiles.length > 0) {
                            handleFileChange({ target: { files: pdfFiles } });
                          }
                        }}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                          hasShareReq
                            ? "opacity-50 cursor-not-allowed border-gray-300"
                            : "border-gray-300 hover:border-gold"
                        }`}
                      >
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload-pdf"
                              className={`relative cursor-pointer bg-white rounded-md font-medium text-gold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold ${
                                hasShareReq
                                  ? "pointer-events-none"
                                  : "hover:text-forest"
                              }`}
                            >
                              <span>{t("signPDF.upload_btn")}</span>
                              <input
                                id="file-upload-pdf"
                                name="file-upload-pdf"
                                type="file"
                                accept="application/pdf"
                                multiple
                                onChange={handleFileChange}
                                className="sr-only"
                                disabled={hasShareReq} // disable input if flag is true
                              />
                            </label>
                            <p className="pl-1">{t("or_drag_and_drop")}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {t("pdf_up_to_20mb")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Uploaded Files List */}
                  {files.length > 0 && !showPreview && (
                    <div className="bg-white rounded-lg shadow p-4 mt-2">
                      <ul className="divide-y divide-gray-200">
                        {files.map((file, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center py-2 ${
                              file._dragging ? "bg-yellow-100" : ""
                            }`}
                            draggable={!hasShareReq} // disable drag if flag is true
                            onDragStart={() =>
                              !hasShareReq && handleDragStart(idx)
                            }
                            onDragOver={() =>
                              !hasShareReq && handleDragOver(idx)
                            }
                            onDragEnd={() => !hasShareReq && handleDragEnd()}
                          >
                            <span className="flex-1 truncate text-gray-800 text-sm">
                              {file.name}
                            </span>
                            <button
                              onClick={() => !hasShareReq && handleRemove(idx)}
                              disabled={hasShareReq} // disable remove button
                              className={`ml-4 text-red-500 text-xs font-medium ${
                                !hasShareReq
                                  ? "hover:text-red-700"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              {t("signPDF.remove")}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!showPreview && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleContinue}
                            disabled={files.length === 0 || loading}
                            className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                              files.length === 0 || loading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:scale-105"
                            }`}
                          >
                            {loading ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                {t("signPDF.loading")}
                              </>
                            ) : (
                              t("signPDF.continue_btn")
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("signPDF.continue_tooltip")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {/* Available Signatures */}
                  {showPreview && (
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {t("signPDF.preview")}
                      </h3>
                      <div className="mb-4 flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() =>
                                  handleAddFreeText(currentPage - 1)
                                }
                                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200 border border-dashed border-gray-300 hover:border-blue-500"
                              >
                                <Edit2 className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-blue-600 font-medium">
                                  {t("signPDF.add_free_text")}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("signPDF.add_free_text_tooltip")}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {/* Action Buttons */}

                        <div className="flex gap-3 items-center">
                          <TooltipProvider>
                            {/* ➤ Add Signature */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                                  onClick={() => setSignatureModal(true)}
                                >
                                  <FileSignature className="w-6 h-6 text-blue-600 hover:text-blue-800" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("signPDF.addSign")}
                              </TooltipContent>
                            </Tooltip>

                            {/* ➤ Upload Signed */}
                            {hasShareReq && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                                    onClick={() => handleFinalSubmit(true)}
                                  >
                                    <Upload className="w-6 h-6 text-blue-600 hover:text-blue-800" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("signPDF.uploadSigned")}
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* ➤ Download */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200 text-forest hover:text-gold"
                                  onClick={() => handleFinalSubmit(false)}
                                >
                                  <Download
                                    className={`w-6 h-6 ${
                                      loading ? "animate-spin" : ""
                                    }`}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("signPDF.download")}
                              </TooltipContent>
                            </Tooltip>

                            {/* ➤ Clear All */}
                            {files.length > 0 && hasShareReq === false && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                                    onClick={() => handleClearAll()}
                                  >
                                    <Trash2 className="w-6 h-6 text-red-500 hover:text-red-700" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("signPDF.clear_signature")}
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* ➤ Exit Share */}
                            {hasShareReq === true && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                                    onClick={() => handleReloadPage()}
                                  >
                                    <LogOut className="w-6 h-6 text-gray-600 hover:text-gray-800" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("signPDF.exitShare")}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TooltipProvider>
                          {/* In the preview section action buttons */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-200"
                                  onClick={handleFinalShare}
                                  disabled={shareLoading}
                                >
                                  <Share className="w-6 h-6 text-green-600 hover:text-green-800" />
                                  <span className="text-sm text-green-600 font-medium">
                                    {shareLoading
                                      ? t("signPDF.sharing")
                                      : t("signPDF.share")}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("signPDF.share_document")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      {appliedSignatures.length > 0 && (
                        <div className="space-y-3 max-h-[350px] overflow-x-auto">
                          {appliedSignatures.map((sig, index) => {
                            // For all text types, get the text from the first placement or signature text
                            const displayText =
                              sig.placements?.[0]?.text || sig.text || "";

                            return (
                              <div
                                key={index}
                                className="border rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium capitalize">
                                    {t(`signPDF.${sig.type}`)}
                                  </span>
                                  <div className="flex gap-2">
                                    {/* Edit Icon */}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() =>
                                              handleEditSignature(sig)
                                            }
                                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {t("signPDF.edit_signature")}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    {/* Place Button */}
                                    <button
                                      onClick={() =>
                                        handleAddPlacement(
                                          sig.id,
                                          currentPage - 1
                                        )
                                      }
                                      className="px-3 py-1 bg-forest text-white text-sm rounded hover:bg-gold hover:text-forest"
                                    >
                                      {t(`signPDF.place_${sig.type}`)}
                                    </button>
                                  </div>
                                </div>

                                {(sig.type === "fullName" ||
                                  sig.type === "initials" ||
                                  sig.type === "freeText") && (
                                  <div
                                    style={{
                                      fontFamily: sig.fontFamily,
                                      color: sig.color,
                                      fontSize: `${sig.fontSize}px`,
                                    }}
                                    className="text-center"
                                  >
                                    {displayText || t("signPDF.no_text_added")}
                                  </div>
                                )}

                                {sig.type === "signature" &&
                                  sig.signatureData && (
                                    <img
                                      src={sig.signatureData}
                                      alt="Signature"
                                      className="h-8 mx-auto"
                                    />
                                  )}

                                {sig.type === "image" && sig.imageFile && (
                                  <img
                                    src={URL.createObjectURL(sig.imageFile)}
                                    alt="Logo"
                                    className="h-8 mx-auto"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column - PDF Preview */}
            {showPreview && files[0] && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {t("signPDF.preview")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      {t("signPDF.back")}
                    </button>
                    <span className="text-sm">
                      {t("signPDF.step_review")} {currentPage} {t("of")}{" "}
                      {numPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(numPages, prev + 1))
                      }
                      disabled={currentPage === numPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      {t("signPDF.next")}
                    </button>
                  </div>
                </div>
                <div
                  className="border rounded-lg overflow-auto bg-gray-50 relative"
                  style={{ maxHeight: "100vh" }}
                >
                  <Document
                    file={files[0]}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    <Page pageNumber={currentPage} width={600} />
                    {/* Render placements for current page */}
                    {appliedSignatures
                      .flatMap(
                        (sig) =>
                          sig.placements?.filter(
                            (pl) => pl.page === currentPage - 1
                          ) || []
                      )
                      .map((placement) => (
                        <Rnd
                          key={placement.id}
                          bounds="parent"
                          size={{
                            width: placement.width,
                            height: placement.height,
                          }}
                          position={{ x: placement.x, y: placement.y }}
                          onDragStop={(e, d) =>
                            handlePlacementUpdate(placement.id, {
                              x: d.x,
                              y: d.y,
                            })
                          }
                          onResizeStop={(
                            e,
                            direction,
                            ref,
                            delta,
                            position
                          ) => {
                            handlePlacementUpdate(placement.id, {
                              x: position.x,
                              y: position.y,
                              width: parseInt(ref.style.width, 10),
                              height: parseInt(ref.style.height, 10),
                            });
                          }}
                          style={{
                            border: "2px dashed #3b82f6",
                            zIndex: 10,
                            background:
                              placement.type === "text"
                                ? "rgba(243, 244, 246, 0.8)"
                                : "transparent",
                            borderRadius: "4px",
                          }}
                        >
                          <div className="relative w-full h-full">
                            {placementAssignments[placement.id] && (
                              <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                {
                                  placementRecipients.find(
                                    (r) =>
                                      r.email ===
                                      placementAssignments[placement.id]
                                  )?.name
                                }
                              </div>
                            )}

                            {/* Assign button */}
                            <button
                              onClick={() => handleOpenAssignModal(placement)}
                              className="absolute -top-2 -right-8 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center z-20 hover:bg-blue-600"
                              title={t("signPDF.assign_recipient")}
                            >
                              <User className="w-3 h-3" />
                            </button>
                            {/* Close button */}
                            <button
                              onClick={() =>
                                handleRemovePlacement(placement.id)
                              }
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center z-20"
                            >
                              ×
                            </button>
                            {placement.type === "image" &&
                              placement.imageFile && (
                                <img
                                  src={URL.createObjectURL(placement.imageFile)}
                                  alt="Placed image"
                                  className="w-full h-full object-contain"
                                />
                              )}
                            {placement.type === "signature" &&
                              placement.signatureData && (
                                <img
                                  src={placement.signatureData}
                                  alt="Signature"
                                  className="w-full h-full object-contain"
                                />
                              )}
                            {(placement.type === "fullName" ||
                              placement.type === "initials" ||
                              placement.type === "freeText") && (
                              <EditablePlacement
                                placement={placement}
                                onTextChange={handleTextChange}
                              />
                            )}
                          </div>
                        </Rnd>
                      ))}
                  </Document>
                </div>
              </div>
            )}
          </div>
        </div>

        {!showPreview && (
          <div className="mt-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-forest mb-6">
                  {t("signPDF.document_history")}
                </h2>

                {historyLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                    <span className="ml-2 text-gray-600">
                      {t("signPDF.loading")}
                    </span>
                  </div>
                ) : historyData.length > 0 ? (
                  <div className="max-h-[500px] overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("signPDF.document_name")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("signPDF.file_path")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("signPDF.status")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("signPDF.created_date")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("signPDF.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historyData.map((doc, index) => (
                          <tr
                            key={doc._id || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.file_name || "Untitled Document"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {doc.file_path || "--"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {doc.status || "--"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.createdAt
                                ? new Date(doc.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "--"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() =>
                                          handleViewHistoryDoc(doc)
                                        }
                                        className="text-blue-600 hover:text-blue-800 transition duration-200 p-1 rounded hover:bg-gray-100"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t("signPDF.view_document")}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {t("signPDF.no_documents")}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("signPDF.no_documents_desc")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {typeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {typeState === "self"
                  ? t("signPDF.who_will_sign")
                  : t("signPDF.several_desc")}
              </h2>
            </div>

            <div className="space-y-4">
              {["self", "several"].map((opt) => {
                const isDisabled = opt === "several" && hasShareReq;
                return (
                  <label
                    key={opt}
                    onClick={() => {
                      if (isDisabled) {
                        toast.error(t("signPDF.allowShareError"));
                        return;
                      }
                      setTypeState(opt);
                    }}
                    className={`flex items-center justify-between p-4 border rounded-lg shadow transition 
                ${
                  typeState === opt
                    ? "border-forest bg-green-50"
                    : "border-gray-200"
                } 
                ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="signerType"
                        value={opt}
                        checked={typeState === opt}
                        onChange={() => setTypeState(opt)}
                        disabled={isDisabled}
                        className="h-4 w-4 text-forest focus:ring-forest"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {t(`signPDF.${opt}`)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setTypeModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                {t("signPDF.back")}
              </button>

              <button
                onClick={
                  typeState === "self" ? handleSelfSubmit : handleSeveralSubmit
                }
                className="px-6 py-2 bg-forest text-white rounded-lg shadow hover:bg-gold hover:text-forest"
              >
                {t("signPDF.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
      {signatureModal && (
        <SignatureModal
          isOpen={signatureModal}
          onClose={() => {
            setSignatureModal(false);
            setEditingSignature(null);
          }}
          signerData={{ files, signerType: typeState }}
          submitAllTabs={submitAllTabs}
          onSignaturesApplied={handleSignaturesApplied}
          sharedDetails={sharedDetails}
          editingSignature={editingSignature}
        />
      )}
      {shareModal && (
        <ShareModal
          isOpen={shareModal}
          onClose={() => setShareModal(false)}
          allowReorder={true}
          // onSubmit={handleShareSubmit}
          shareLoading={shareLoading}
          onRecipientsSaved={handleShareSubmit} // Use the new handler
        />
      )}

      {/* Other modals */}
      {viewInfoModal && (
        <ViewInfoModal
          isOpen={viewInfoModal}
          onClose={() => {
            setViewInfoModal(false);
            setviewInfoData(null);
          }}
          fileInfo={viewInfoData}
          loading={fileInfoLoading}
        />
      )}

      {assignRecipientModal && (
        <AssignRecipientModal
          isOpen={assignRecipientModal}
          onClose={() => {
            setAssignRecipientModal(false);
            setCurrentPlacement(null);
          }}
          placement={currentPlacement}
          recipients={placementRecipients || []} // Add safety check here too
          currentAssignment={placementAssignments[currentPlacement?.id]}
          onAssign={handleAssignRecipient}
        />
      )}
    </>
  );
};
export default SignPDF;
