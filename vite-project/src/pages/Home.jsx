import { useState } from "react";
import OperationCard from "../components/OperationCard";
import DisplayPlans from "../components/DisplayPlans";
import WhyUsSection from "../components/WhyUsSection";
import Footer from "../components/Footer";
import HowItWorksSection from "../components/HowItWorksSection";
import FAQSection from "../components/FAQSection";
import TrustedBySection from "../components/TrustedBySection";
import HeroBanner from "../components/HeroBanner";
import OperationTabsWrapper from "../components/TabWrapper";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";

const Home = () => {
  const { t } = useTranslation();
  const { activeCategory, setActiveCategory } = useAuth();

  const categorizedOperations = {
    "PDF Page Management": [
      { title: t("Merge PDF"), description: t("home.merge_pdf_desc"), route: "/merge-pdf", icon: "🗂️" },
      { title: t("Split PDF"), description: t("home.split_pdf_desc"), route: "/split-pdf", icon: "✂️" },
      { title: t("Remove Pages"), description: t("home.remove_pages_desc"), route: "/remove-pages", icon: "❌" },
      { title: t("Extract Pages"), description: t("home.extract_pages_desc"), route: "/extract-pages", icon: "📄" },
      { title: t("Organize PDF"), description: t("home.organize_pdf_desc"), route: "/organize-pdf", icon: "🗃️" },
      { title: t("Rotate PDF"), description: t("home.rotate_pdf_desc"), route: "/rotate-pdf", icon: "🔄" },
      { title: t("home.metadata_viewer"), description: t("home.metadata_viewer_desc"), route: "/view-metadata", icon: "📑" },
      { title: t("home.update_metadata"), description: t("home.update_metadata_desc"), route: "/update-metadata", icon: "✏️" },
      { title: t("Compare PDF"), description: t("home.compare_pdf_desc"), route: "/compare-pdf", icon: "🆚" },
      { title: t("PDF to PDF/A"), description: t("home.pdf_to_pdfa_desc"), route: "/pdf-to-pdfa", icon: "🗄️" },
    ],
    "Format Conversions (To PDF)": [
      { title: t("JPG to PDF"), description: t("home.jpg_to_pdf_desc"), route: "/jpg-to-pdf", icon: "🖼️" },
      { title: t("Word to PDF"), description: t("home.word_to_pdf_desc"), route: "/word-to-pdf", icon: "📄" },
      { title: t("PowerPoint to PDF"), description: t("home.powerpoint_to_pdf_desc"), route: "/ppt-to-pdf", icon: "📊" },
      { title: t("Excel to PDF"), description: t("home.excel_to_pdf_desc"), route: "/excel-to-pdf", icon: "📈" },
      { title: t("HTML to PDF"), description: t("home.html_to_pdf_desc"), route: "/html-to-pdf", icon: "🌐" },
    ],
    "Format Conversions (From PDF)": [
      { title: t("PDF to JPG"), description: t("home.pdf_to_jpg_desc"), route: "/pdf-to-jpg", icon: "��️" },
      { title: t("PDF to Word"), description: t("home.pdf_to_word_desc"), route: "/pdf-to-word", icon: "📄" },
      { title: t("PDF to PowerPoint"), description: t("home.pdf_to_powerpoint_desc"), route: "/pdf-to-ppt", icon: "📊" },
      { title: t("PDF to Excel"), description: t("home.pdf_to_excel_desc"), route: "/pdf-to-excel", icon: "📈" },
      { title: t("home.pdf_to_text"), description: t("home.pdf_to_text_desc"), route: "/pdf-to-text", icon: "📄" },
      { title: t("home.pdf_voice_reader"), description: t("home.pdf_voice_reader_desc"), route: "/pdf-voice-reader", icon: "🔊" },
  { title: t("home.handwriting"), description: t("home.handwriting_desc"), route: "/handwriting", icon: "✒️" },
  { title: t("home.pdf_expire"), description: t("home.pdf_expire_desc"), route: "/pdf-expire", icon: "⏳" },
],
    "Security & Watermarking": [
      { title: t("Unlock PDF"), description: t("home.unlock_pdf_desc"), route: "/unlock-pdf", icon: "🔓" },
      { title: t("home.protect_pdf"), description: t("home.protect_pdf_desc"), route: "/protect-pdf", icon: "🔒" },
      { title: t("Add Page Numbers"), description: t("home.add_page_numbers_desc"), route: "/add-page-numbers", icon: "🔢" },
      { title: t("Add Watermark"), description: t("home.add_watermark_desc"), route: "/add-watermark", icon: "💧" },
      { title: t("Compress PDF"), description: t("home.compress_pdf_desc"), route: "/compress-pdf", icon: "📉" },
    ],
    "eDocs,eForms & eSignatures": [
      { title: t("home.e_sign"), description: t("home.e_sign_desc"), route: "/e-sign", icon: "🖋️" } ,
      { title: t("home.sign_pdf"), description: t("home.sign_pdf_desc"), route: "/sign-PDF", icon: "🖋️" }   
    ],
    "Pdf Translate": [
  { title: t("home.translate"), description: t("home.translate_desc"), route: "/translate", icon: "🌍" },
    ],
  };

  const categories = Object.keys(categorizedOperations);

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>Convert PDF to Word Online Free | Fast & Accurate</title>
      <meta
        name="description"
        content="Easily convert PDF to Word online with PDFPivot. Get editable Word documents in seconds. Free, secure, and simple—no sign-up or installation needed."
      />

      {/* Open Graph (text-only) */}
      <meta
        property="og:title"
        content="Convert PDF to Word Online Free | Fast & Accurate"
      />
      <meta
        property="og:description"
        content="Easily convert PDF to Word online with PDFPivot. Get editable Word documents in seconds. Free, secure, and simple—no sign-up or installation needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:title"
        content="Convert PDF to Word Online Free | Fast & Accurate"
      />
      <meta
        name="twitter:description"
        content="Easily convert PDF to Word online with PDFPivot. Get editable Word documents in seconds. Free, secure, and simple—no sign-up or installation needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gray-50">
      {/* Operation Cards */}
      <OperationTabsWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-start items-stretch px-4">
          {categorizedOperations[activeCategory].map((op) => (
            <OperationCard
              key={op.route}
              title={op.title}
              description={op.description}
              route={op.route}
              icon={op.icon}
            />
          ))}
        </div>
      </OperationTabsWrapper>

      <div className="bg-[#FFF9E5]">
        <HowItWorksSection />
      </div>
      <div className="bg-[#FFF9E5]">
        <HeroBanner />
      </div>
      <div className="bg-white">
        <DisplayPlans />
      </div>
      <div className="bg-[#FFF9E5]">
        <WhyUsSection />
      </div>
      <div className="bg-white">
        <TrustedBySection />
      </div>
      <div className="bg-[#FFF9E5]">
        <FAQSection />
      </div>
    </div>
    </>
  );
};

export default Home;
