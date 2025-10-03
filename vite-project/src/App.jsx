import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AdminDashboard from './pages/AdminDashboard';
import PlanManagement from './pages/PlanManagement';
import UserManagement from './pages/UserManagement';
import ForgotPassword from './pages/ForgotPassword';
import MergePdfPage from './pages/MergePdfPage';
import SplitPdfPage from "./pages/SplitPdfPage";
import RemovePdfPage from "./pages/RemovePdfPage";
import ExtractPdfPage from "./pages/ExtractPdfPage";
import RotatePdfPage from './pages/RotatePdfPage';
import CompressPdfPage from './pages/CompressPdfPage';
import JpgToPdfPage from './pages/JpgToPdfPage';
import WordToPdfPage from './pages/WordToPdfPage';
import PdfToJpgPage from './pages/PdfToJpgPage';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import AddPageNumbersPage from './pages/AddPageNumbersPage';
import { FaHashtag } from 'react-icons/fa';
import UnlockPdfPage from './pages/UnlockPdfPage';
import HtmlToPdfPage from './pages/HtmlToPdfPage';
import OrganizePdfPage from './pages/OrganizePdfPage';
import PptToPdfPage from "./pages/PptToPdf";
import ExcelToPdfPage from "./pages/ExcelToPdf";
import PdfToWordPage from "./pages/PdfToWord";
import PdfToPptPage from "./pages/PdfToPPT";
import PdfToExcelPage from "./pages/PdfToExcelPage";
import PdfToPdfaPage from "./pages/PdfToPdfA";
import PdfProtectionPage from "./pages/Protectedpdf";
import PdfComparePage from "./pages/CompareTwoPdf";
import PdfWatermarkPage from "./pages/WatermarkPdf";
import PdfRedactionPage from "./pages/PdfRedactionPage";
import PdfToTextPage from "./pages/PdfToText";
import UpdateMetadataPage from "./pages/UpdateMetaData";
import PdfMetadataViewer from "./pages/MetaDataViewer";
import PaymentFailedPage from "./pages/PaymentFailed";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import SubscribePage from "./pages/SubscribePage";
import OperationTabsWrapper from "./components/TabWrapper";
import PaymentHistoryPage from "./pages/UserPaymentHistory";
import AdminPaymentDashboard from "./pages/AdminPaymentDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundCancellationPolicy from "./pages/RefundPolicy";
import TermsOfService from "./pages/TermsConditions";
import LanguageSelector from "./components/LanguageSelector";
import PdfVoiceReaderPage from "./pages/pdfVoiceReaderPage";
import PdfTranslatorPage from "./pages/pdfTranslatorPage";
import HandwritingPdfPage from "./pages/HandWritingPdfPage";
import PdfExpiryPage from "./pages/PdfExpiry";
import ESignPdfPage from "./pages/eSignPdf";
import SignPDF from "./pages/SignPdf";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <LanguageSelector/>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/plans" element={<SubscriptionPlans />} />
                  <Route path="/subscribe" element={<SubscribePage />} />
              <Route path="/success" element={<PaymentSuccessPage />} />
              <Route path="/cancel" element={<PaymentFailedPage />}/>
              <Route path="/payment-history" element={<PaymentHistoryPage />}/>
              <Route path="/privacy-policy" element={<PrivacyPolicy />}/>
              <Route path="/refund-policy" element={<RefundCancellationPolicy />}/>
              <Route path="/terms-conditions" element={<TermsOfService />}/>
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/plans" element={
                <AdminRoute>
                  <PlanManagement />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              <Route path="/admin/payment-history" element={
                <AdminRoute>
                  <AdminPaymentDashboard />
                </AdminRoute>
              } />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/merge-pdf" element={<OperationTabsWrapper><MergePdfPage /></OperationTabsWrapper>} />
              <Route path="/split-pdf" element={<OperationTabsWrapper><SplitPdfPage /></OperationTabsWrapper>} />
              <Route path="/remove-pages" element={<OperationTabsWrapper><RemovePdfPage /></OperationTabsWrapper>} />
              <Route path="/extract-pages" element={<OperationTabsWrapper><ExtractPdfPage /></OperationTabsWrapper>} />
              <Route path="/rotate-pdf" element={<OperationTabsWrapper><RotatePdfPage /></OperationTabsWrapper>} />
              <Route path="/compress-pdf" element={<OperationTabsWrapper><CompressPdfPage /></OperationTabsWrapper>} />
              <Route path="/jpg-to-pdf" element={<OperationTabsWrapper><JpgToPdfPage /></OperationTabsWrapper>} />
              <Route path="/word-to-pdf" element={<OperationTabsWrapper><WordToPdfPage /></OperationTabsWrapper>} />
              <Route path="/pdf-to-jpg" element={<OperationTabsWrapper><PdfToJpgPage /></OperationTabsWrapper>} />
              <Route path="/add-page-numbers" element={<OperationTabsWrapper><AddPageNumbersPage /></OperationTabsWrapper>} />
              <Route path="/unlock-pdf" element={<OperationTabsWrapper><UnlockPdfPage /></OperationTabsWrapper>} />
              <Route path="/html-to-pdf" element={<OperationTabsWrapper><HtmlToPdfPage /></OperationTabsWrapper>} />
              <Route path="/organize-pdf" element={<OperationTabsWrapper><OrganizePdfPage /></OperationTabsWrapper>} />
              <Route path="/ppt-to-pdf" element={<OperationTabsWrapper><PptToPdfPage /></OperationTabsWrapper>} />
              <Route path="/excel-to-pdf" element={<OperationTabsWrapper><ExcelToPdfPage /></OperationTabsWrapper>} />
              <Route path="/pdf-to-word" element={<OperationTabsWrapper><PdfToWordPage /></OperationTabsWrapper>} />
              <Route path="/pdf-to-ppt" element={<OperationTabsWrapper><PdfToPptPage /></OperationTabsWrapper>} />
              <Route path="/pdf-to-excel" element={<OperationTabsWrapper><PdfToExcelPage /></OperationTabsWrapper>} />
              <Route path="/pdf-to-pdfa" element={<OperationTabsWrapper><PdfToPdfaPage /></OperationTabsWrapper>} />
              <Route path="/protect-pdf" element={<OperationTabsWrapper><PdfProtectionPage /></OperationTabsWrapper>} />
              <Route path="/compare-pdf" element={<OperationTabsWrapper><PdfComparePage /></OperationTabsWrapper>} />
              <Route path="/add-watermark" element={<OperationTabsWrapper><PdfWatermarkPage /></OperationTabsWrapper>} />
              <Route path="/pdf-redaction" element={<OperationTabsWrapper><PdfRedactionPage /></OperationTabsWrapper>} />
              <Route path="/pdf-to-text" element={<OperationTabsWrapper><PdfToTextPage /></OperationTabsWrapper>} />
              <Route path="/update-metadata" element={<OperationTabsWrapper><UpdateMetadataPage /></OperationTabsWrapper>} />
              <Route path="/view-metadata" element={<OperationTabsWrapper><PdfMetadataViewer /></OperationTabsWrapper>} />
              <Route path="/pdf-voice-reader" element={<OperationTabsWrapper><PdfVoiceReaderPage /></OperationTabsWrapper>} />
              <Route path="/translate" element={<OperationTabsWrapper><PdfTranslatorPage /></OperationTabsWrapper>} />
              <Route path="/handwriting" element={<OperationTabsWrapper><HandwritingPdfPage /></OperationTabsWrapper>} />
              <Route path="/pdf-expire" element={<OperationTabsWrapper><PdfExpiryPage /></OperationTabsWrapper>} />
              <Route path="/e-sign" element={<OperationTabsWrapper><ESignPdfPage /></OperationTabsWrapper>} />
              <Route path="/sign-pdf" element={<OperationTabsWrapper><SignPDF /></OperationTabsWrapper>} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
