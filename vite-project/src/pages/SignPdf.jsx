import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Text, Edit2, ImageIcon } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import toast, { Toaster } from "react-hot-toast";

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
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("text");
  const [formData, setFormData] = useState({
    fullName: "",
    initials: "",
    logo: null,
    selectedStyle: FONT_STYLES[0].key,
    color: "#000000",
    drawnSignature: null,
    uploadedSign: null,
  });
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) updateFormData("logo", file);
  };
  // Canvas drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };
  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = formData.color;
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
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("fullName", formData.fullName);
    fd.append("initials", formData.initials);
    fd.append("selectedStyle", formData.selectedStyle);
    fd.append("color", formData.color);
    if (formData.logo) fd.append("logo", formData.logo);
    if (formData.drawnSignature)
      fd.append("drawnSignature", formData.drawnSignature);
    return fd;
  };
  const handleSubmit = () => {
    const signatures = [];
    if (submitAllTabs) {
      const fd = buildFormData();
      // Collect all signature types with complete font information
      if (formData.fullName) {
        const selectedStyle = FONT_STYLES.find(
          (s) => s.key === formData.selectedStyle
        );
        signatures.push({
          id: `text-${Date.now()}`,
          type: "text",
          text: formData.fullName,
          fontFamily: selectedStyle?.fontFamily,
          fontStyle: formData.selectedStyle, // Keep the style key
          color: formData.color,
          fontSize: 24, // Add font size
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
          (s) => s.key === formData.selectedStyle
        );
        signatures.push({
          id: `initials-${Date.now()}`,
          type: "initials",
          text: formData.initials,
          fontFamily: selectedStyle?.fontFamily,
          fontStyle: formData.selectedStyle, // Keep the style key
          color: formData.color,
          fontSize: 24, // Add font size
          width: 200,
          height: 40,
        });
      }
    } else {
      switch (activeTab) {
        case "text":
          if (formData.fullName) {
            const selectedStyle = FONT_STYLES.find(
              (s) => s.key === formData.selectedStyle
            );
            signatures.push({
              id: `text-${Date.now()}`,
              type: "text",
              text: formData.fullName,
              fontFamily: selectedStyle?.fontFamily,
              fontStyle: formData.selectedStyle,
              color: formData.color,
              fontSize: 24,
              width: 200,
              height: 40,
            });
          }
          break;
        case "draw":
          if (formData.drawnSignature) {
            signatures.push({
              id: `signature-${Date.now()}`,
              type: "signature",
              signatureData: formData.drawnSignature,
              width: 150,
              height: 80,
            });
          }
          break;
        case "logo":
          if (formData.logo) {
            signatures.push({
              id: `logo-${Date.now()}`,
              type: "image",
              imageFile: formData.logo,
              width: 100,
              height: 100,
            });
          }
          break;
        case "uploadedSign":
          if (formData.uploadedSign) {
            signatures.push({
              id: `uploadedSign-${Date.now()}`,
              type: "image",
              imageFile: formData.uploadedSign,
              width: 100,
              height: 100,
            });
          }
          break;
      }
    }
    // Pass signatures to parent
    if (onSignaturesApplied && signatures.length > 0) {
      onSignaturesApplied(signatures);
    }
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 flex">
        {/* Vertical Tabs */}
        <div className="flex flex-col gap-4 mr-6">
          <button
            className={`p-2 rounded-lg ${
              activeTab === "text" ? "bg-green-50 border border-green-500" : ""
            }`}
            onClick={() => setActiveTab("text")}
          >
            <Text className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-lg ${
              activeTab === "draw" ? "bg-green-50 border border-green-500" : ""
            }`}
            onClick={() => setActiveTab("draw")}
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-lg ${
              activeTab === "logo" ? "bg-green-50 border border-green-500" : ""
            }`}
            onClick={() => setActiveTab("logo")}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "text" && (
            <div className="space-y-4">
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
                      (s) => s.key === formData.selectedStyle
                    )?.fontFamily,
                    color: formData.color,
                  }}
                />
              </div>
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
                      (s) => s.key === formData.selectedStyle
                    )?.fontFamily,
                    color: formData.color,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {FONT_STYLES.map((style) => (
                  <div
                    key={style.key}
                    onClick={() => updateFormData("selectedStyle", style.key)}
                    className={`border rounded-md p-2 text-center cursor-pointer ${
                      formData.selectedStyle === style.key
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: "24px",
                      color: formData.color,
                    }}
                  >
                    {formData.fullName || t("signPDF.full_name")}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => updateFormData("color", c.code)}
                    className={`w-7 h-7 rounded-full border-2 ${
                      formData.color === c.code
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: c.code }}
                  ></button>
                ))}
              </div>
            </div>
          )}
          {activeTab === "draw" && (
            <div className="mt-2 grid grid-rows-2 gap-4">
              {/* Top Half: Drawing */}
              <div
                className="border rounded-md p-2 flex flex-col items-center"
                style={{ maxHeight: "200px" }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("signPDF.signature")}
                </label>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={80}
                  className="border rounded-md w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  style={{ cursor: "crosshair" }}
                />
              </div>
              {/* Bottom Half: Upload Signature Image */}
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
                      <p className="pl-1">{t("or_drag_and_drop")}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("image_up_to_5mb")}
                    </p>
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
                    <p className="pl-1">{t("or_drag_and_drop")}</p>
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
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-forest text-white rounded-lg hover:bg-gold hover:text-forest"
            >
              {t("signPDF.submit")}
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
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(placement.text);
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  const handleBlur = () => {
    setIsEditing(false);
    onTextChange(placement.id, text);
  };
  return (
    <div
      className="w-full h-full flex items-center justify-center p-1"
      onDoubleClick={() => setIsEditing(true)}
      style={{
        fontFamily: placement.fontFamily,
        color: placement.color,
        fontSize: `${placement.fontSize || 16}px`,
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
        />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
};
const roles = ["signer", "viewer", "validator"];
const signFormats = ["all", "text", "draw", "uploadedSign"];
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
const ShareModal = ({ isOpen, onClose, allowReorder = true, onSubmit }) => {
  const { t } = useTranslation();
  const [recipients, setRecipients] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [activeSettingsId, setActiveSettingsId] = useState(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(true);
  const [settingsSet, setSettingsSet] = useState([]);
  const [errors, setErrors] = useState({}); // NEW: track errors per recipient
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
  // ------
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
        allowedFormats: ["all"],
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
      return; // stop submission if invalid
    }

    try {
      // Await the parent onSubmit, which should return a status
      const result = await onSubmit({
        recipients,
        globalSettings: settingsSet,
      });

      // Check if the submission was successful
      if (result?.status === "success") {
        toast.success(t("signPDF.share_success"));
        resetModal(); // Reset modal state
        onClose(); // Close the modal
      } else {
        toast.error(t("signPDF.share_failed"));
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
          {/* Recipients list */}
          {recipients.map((r, idx) => (
            <div
              key={r.id}
              className={`flex flex-col gap-1 p-3 border rounded-lg ${
                draggingIndex === idx ? "bg-yellow-100" : ""
              }`}
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
                  onChange={(e) => handleChange(r.id, "email", e.target.value)}
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

          {/* Active settings for each recipient */}
          {recipients.map(
            (r) =>
              activeSettingsId === r.id && (
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
                  <select
                    value={r.allowedFormats[0]}
                    onChange={(e) =>
                      handleChange(r.id, "allowedFormats", [e.target.value])
                    }
                    className="border p-2 rounded"
                  >
                    {signFormats.map((f) => (
                      <option key={f} value={f}>
                        {t(`signPDF.signFormat${f}`)}
                      </option>
                    ))}
                  </select>
                </div>
              )
          )}
          <button
            onClick={handleAddRecipient}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            + {t("signPDF.add_recipient")}
          </button>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
            >
              {t("signPDF.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-forest text-white rounded"
            >
              {t("signPDF.save_continue")}
            </button>
          </div>
        </div>
        {/* Right side: Global Settings */}
        {showGlobalSettings && (
          <div className="w-80 border-l border-gray-200 pl-4 max-h-[600px] overflow-y-auto">
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
        )}
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
  const [tempFileData, setTempFileData] = useState(null);
  const handleShareSubmit = async ({ recipients, globalSettings }) => {
    console.log(recipients, "Got in recipients");
    // Prepare payload
    const payload = {
      file_path: tempFileData.file_path,
      file_name: tempFileData.file_name,
      shared_users: recipients.map((user) => ({
        user_name: user.name,
        user_email: user.email,
        user_validation: user.allowedFormats || "viewer", // default
        user_password: user.password || "",
        user_role: user.role || "",
      })),
      settings: globalSettings,
    };
    try {
      const response = await axios.post("/api/esign/share", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {}
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
  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (newFiles.length === 0) {
      setError(t("signPDF.signPdf_error"));
      return;
    }
    // Keep only the latest file
    const fileToUpload = newFiles[0];
    setFiles([fileToUpload]);
    setError(null);
    // Prepare FormData
    const formData = new FormData();
    formData.append("pdf-file", fileToUpload); // payload key "pdf-file"
    try {
      const response = await axios.post("/api/esign/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.status === "success") {
        const data = response.data?.data;
        // object should appear correctly
        setTempFileData(data ?? {});
      } else {
        setError(t("signPDF.upload_failed"));
      }
    } catch (err) {
      setError(t("signPDF.upload_failed")); // optional: display error
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
  // Handle signatures applied from modal
  const handleSignaturesApplied = (signatures) => {
    setAppliedSignatures(signatures);
    setShowPreview(true);
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
      text:
        signature.type === "text" || signature.type === "initials"
          ? signature.text
          : undefined,
      fontFamily:
        signature.type === "text" || signature.type === "initials"
          ? signature.fontFamily
          : undefined,
      color:
        signature.type === "text" || signature.type === "initials"
          ? signature.color
          : undefined,
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
            pl.id === id ? { ...pl, text: value } : pl
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
  // Final submission
  const handleFinalSubmit = async () => {
    if (!files[0]) return alert(t("signPDF.uploadPDFFirst"));
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);
      // Add all placements with complete styling information
      const allPlacements = appliedSignatures.flatMap(
        (sig) => sig.placements || []
      );
      // Ensure font data is preserved
      const placementsWithStyles = allPlacements.map((placement) => ({
        ...placement,
        fontFamily: placement.fontFamily || FONT_STYLES[0].fontFamily,
        color: placement.color || "#000000",
        fontSize: placement.fontSize || 24,
      }));
      formData.append("placements", JSON.stringify(placementsWithStyles));
      // Add image files and signature data
      const imagePromises = [];
      appliedSignatures.forEach((sig) => {
        // Handle image files (logos and uploaded signatures)
        if (sig.type === "image" && sig.imageFile) {
          formData.append("images", sig.imageFile);
        }
        // Handle drawn signatures (convert data URL to blob)
        if (
          sig.type === "signature" &&
          sig.signatureData &&
          sig.signatureData.startsWith("data:")
        ) {
          const promise = fetch(sig.signatureData)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], `signature-${sig.id}.png`, {
                type: "image/png",
              });
              formData.append("signatures", file);
            });
          imagePromises.push(promise);
        }
        // Handle uploaded signature images
        if (sig.type === "signature" && sig.imageFile) {
          formData.append("images", sig.imageFile);
        }
      });
      // Wait for all image conversions to complete
      await Promise.all(imagePromises);
      // Only track usage if user is logged in
      if (token) {
        await axios.post(
          "/api/user/track",
          {
            service: "e-sign",
            imageCount: appliedSignatures.filter(
              (sig) => sig.type === "image" || sig.type === "signature"
            ).length,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
      // Submit for signing using the new route
      const res = await axios.post("/api/sign-PDF", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed-document.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(t("signPDF.failed_to_create"));
    } finally {
      setLoading(false);
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
    setTempFileData(null);
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
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200">
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
                              className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold"
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
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={() => handleDragOver(idx)}
                            onDragEnd={handleDragEnd}
                          >
                            <span className="flex-1 truncate text-gray-800 text-sm">
                              {file.name}
                            </span>
                            <button
                              onClick={() => handleRemove(idx)}
                              className="ml-4 text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              {t("signPDF.remove")}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Available Signatures */}
                  {showPreview && appliedSignatures.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        {t("signPDF.preview")}
                      </h3>
                      <div className="space-y-3">
                        {appliedSignatures.map((sig, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">
                                {t(`signPDF.${sig.type}`)}
                              </span>
                              <button
                                onClick={() =>
                                  handleAddPlacement(sig.id, currentPage - 1)
                                }
                                className="px-3 py-1 bg-forest text-white text-sm rounded hover:bg-gold hover:text-forest"
                              >
                                {t(`signPDF.place_${sig.type}`)}
                              </button>
                            </div>
                            {sig.type === "text" && (
                              <div
                                style={{
                                  fontFamily: sig.fontFamily,
                                  color: sig.color,
                                }}
                                className="text-center"
                              >
                                {sig.text}
                              </div>
                            )}
                            {sig.type === "initials" && (
                              <div
                                style={{
                                  fontFamily: sig.fontFamily,
                                  color: sig.color,
                                }}
                                className="text-center"
                              >
                                {sig.text}
                              </div>
                            )}
                            {sig.type === "signature" && sig.signatureData && (
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
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Action Buttons */}
                  {!showPreview ? (
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
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSignatureModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {t("signPDF.addSign")}
                      </button>
                      <button
                        onClick={handleFinalSubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-forest text-white rounded-lg hover:bg-gold hover:text-forest flex-1"
                      >
                        {loading ? t("signPDF.loading") : t("signPDF.download")}
                      </button>
                    </div>
                  )}
                  {files.length > 0 && (
                    <button
                      onClick={() => handleClearAll()}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 ml-[10px]"
                    >
                      {t("signPDF.clear_signature")}
                    </button>
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
                  style={{ maxHeight: "70vh" }}
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
                            {placement.type === "text" && (
                              <EditablePlacement
                                placement={placement}
                                onTextChange={handleTextChange}
                              />
                            )}
                            {placement.type === "initials" && (
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
              {["self", "several"].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center justify-between p-4 border rounded-lg shadow cursor-pointer transition ${
                    typeState === opt
                      ? "border-forest bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="signerType"
                      value={opt}
                      checked={typeState === opt}
                      onChange={() => setTypeState(opt)}
                      className="h-4 w-4 text-forest focus:ring-forest"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {t(`signPDF.${opt}`)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setTypeModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                {t("signPDF.back")}
              </button>
              {typeState === "self" ? (
                <button
                  onClick={handleSelfSubmit}
                  className="px-6 py-2 bg-forest text-white rounded-lg shadow hover:bg-gold hover:text-forest"
                >
                  {t("signPDF.submit")}
                </button>
              ) : (
                <button
                  onClick={handleSeveralSubmit}
                  className="px-6 py-2 bg-forest text-white rounded-lg shadow hover:bg-gold hover:text-forest"
                >
                  {t("signPDF.submit")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <SignatureModal
        isOpen={signatureModal}
        onClose={() => setSignatureModal(false)}
        signerData={{ files, signerType: typeState }}
        submitAllTabs={submitAllTabs}
        onSignaturesApplied={handleSignaturesApplied}
      />
      <ShareModal
        isOpen={shareModal}
        onClose={() => setShareModal(false)}
        allowReorder={true} // toggle reordering here
        onSubmit={handleShareSubmit}
      />
    </>
  );
};
export default SignPDF;
