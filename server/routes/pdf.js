const cloudinary = require("cloudinary").v2;
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFDocument, PDFName, PDFDict, PDFStream, PDFNumber,rgb,degrees,StandardFonts  } = require('pdf-lib');
const archiver = require('archiver');
const sharp = require('sharp');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const libre = require('libreoffice-convert');
const router = express.Router();
const puppeteer = require('puppeteer');
const PptxGenJS = require('pptxgenjs');
const upload = multer({ dest: 'uploads/' });
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const PDFParser = require('pdf2json');
const gTTS = require("gtts");
const gtranslate = require("@vitalets/google-translate-api");
const fontkit =require("@pdf-lib/fontkit");
const { v4: uuidv4 } = require("uuid");
const fsp = require("fs").promises;
const dotenv=require('dotenv');
const axios = require('axios');
const FormData=require('form-data');
const https = require("https");
const pdf2json=require('pdf2json')
const { fromPath } = require("pdf2pic");
const Tesseract = require("tesseract.js");
const Sharelinks = require("../models/Sharelinks");
const crypto=require('crypto')
const uploadMemory = multer({ storage: multer.memoryStorage() });
dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
// Set LibreOffice path for Windows
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const FONT_PATH = "fonts/NotoSans-Regular.ttf";
// Helper function to compress images in PDF
async function compressImages(pdfDoc, compressionLevel) {
  console.log('Starting image compression...');
  const pages = pdfDoc.getPages();
  const quality = compressionLevel === 'low' ? 80 : compressionLevel === 'medium' ? 60 : 40;
  console.log(`Compression quality set to: ${quality}`);

  for (let i = 0; i < pages.length; i++) {
    console.log(`Processing page ${i + 1} of ${pages.length}`);
    const page = pages[i];
    const { width, height } = page.getSize();
    
    // Get all images on the page
    const images = await page.node.Resources().lookup(PDFName.of('XObject'), PDFDict);
    if (!images) {
      console.log(`No images found on page ${i + 1}`);
      continue;
    }

    console.log(`Found ${Object.keys(images.dict).length} images on page ${i + 1}`);
    for (const [name, image] of Object.entries(images.dict)) {
      if (image instanceof PDFStream) {
        console.log(`Compressing image ${name} on page ${i + 1}`);
        const imageData = await image.getBytes();
        const compressedImage = await sharp(imageData)
          .jpeg({ quality })
          .toBuffer();
        
        // Replace the original image with compressed version
        image.dict.set(PDFName.of('Length'), PDFNumber.of(compressedImage.length));
        image.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
        image.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
        image.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
        image.dict.set(PDFName.of('Width'), PDFNumber.of(width));
        image.dict.set(PDFName.of('Height'), PDFNumber.of(height));
        image.dict.set(PDFName.of('Data'), compressedImage);
        console.log(`Successfully compressed image ${name}`);
      }
    }
  }
  console.log('Image compression completed');
}

// JPG to PDF Route
router.post('/jpg-to-pdf', upload.array('images'), async (req, res) => {
  console.log('JPG to PDF conversion route accessed');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ error: 'No images uploaded' });
    }

    console.log('Files received:', req.files.length);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Process each image
    for (const file of req.files) {
      console.log('Processing file:', file.originalname);
      
      // Read the image file
      const imageBytes = fs.readFileSync(file.path);
      
      // Convert image to JPEG if needed
      const jpegImage = await sharp(imageBytes)
        .jpeg()
        .toBuffer();
      
      // Embed the image in the PDF
      const image = await pdfDoc.embedJpg(jpegImage);
      
      // Add a new page with the image
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
      
      // Clean up the temporary file
      fs.unlinkSync(file.path);
    }

    // Save the PDF
    console.log('Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log('PDF created successfully');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.pdf');

    // Send the PDF
    console.log('Sending response...');
    res.send(Buffer.from(pdfBytes));
    console.log('Response sent successfully');

  } catch (error) {
    console.error('JPG to PDF conversion error:', error);
    res.status(500).json({ error: 'Failed to convert images to PDF: ' + error.message });
  }
});

// PDF Compression Route
router.post('/pdf/compress', upload.single('pdf'), async (req, res) => {
  console.log('PDF compression route accessed');
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const compressionLevel = req.body.compressionLevel || 'screen'; // screen, ebook, printer, prepress
    console.log('Compression level:', compressionLevel);

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `compressed_${Date.now()}.pdf`);

    // Ghostscript command for PDF compression
const compressionLevels = {
  low: '/screen',
  medium: '/ebook',
  high: '/printer'
};

const gsLevel = compressionLevels[compressionLevel] || '/screen';

const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${gsLevel} -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;

    console.log('Running Ghostscript command:', command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Ghostscript error:', stderr);
        fs.unlinkSync(inputPath); // Clean up
        return res.status(500).json({ error: 'Failed to compress PDF' });
      }

      console.log('Compression complete.');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');

      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res).on('finish', () => {
        console.log('Compressed PDF sent to client.');
        // Clean up
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Failed to compress PDF: ' + error.message });
  }
});

router.post('/merge-pdf', upload.array('pdfs'), async (req, res) => {
  try {
    const PDFMerger = (await import('pdf-merger-js')).default;
    console.log('Files received:', req.files);
    const merger = new PDFMerger();
    for (const file of req.files) {
      console.log('Adding file:', file.path);
      await merger.add(file.path);
    }
    const mergedPath = path.join(__dirname, '../uploads/merged.pdf');
    await merger.save(mergedPath);
    console.log('Merged PDF saved at:', mergedPath);

    res.download(mergedPath, 'merged.pdf', (err) => {
      req.files.forEach(f => fs.unlinkSync(f.path));
      fs.unlinkSync(mergedPath);
    });
  } catch (err) {
    console.error('Merge PDF error:', err);
    res.status(500).json({ error: 'Failed to merge PDFs.' });
  }
});

router.post('/split-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Example: Split into individual pages
    const outputDir = path.join(__dirname, '../uploads/split');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const archive = archiver('zip');
    res.attachment('split-pages.zip');
    archive.pipe(res);

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      const newPdfBytes = await newPdf.save();
      archive.append(Buffer.from(newPdfBytes), { name: `page-${i + 1}.pdf` });
    }

    archive.finalize();

    // Clean up
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Split PDF error:', err);
    res.status(500).json({ error: 'Failed to split PDF.' });
  }
});

// PDF to JPG Route
router.post('/pdf-to-jpg', upload.single('pdf'), async (req, res) => {
  console.log('PDF to JPG conversion route accessed');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const outputDir = path.join(__dirname, '../uploads', `${Date.now()}_jpgs`);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // Build the pdftoppm command
    // -jpeg: output JPEG format
    // -r 300: 300 DPI for good quality
    // output files will be named page-1.jpg, page-2.jpg, etc.
    const cmd = `pdftoppm -jpeg -r 300 "${pdfPath}" "${path.join(outputDir, 'page')}"`;

    console.log('Running command:', cmd);

    // Wrap exec in a Promise
    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('pdftoppm error:', stderr || error);
          return reject(error);
        }
        resolve();
      });
    });

    console.log('Conversion completed');

    // Collect all generated JPG files
    const imageFiles = fs.readdirSync(outputDir)
      .filter(file => file.toLowerCase().endsWith('.jpg'))
      .map(file => path.join(outputDir, file));

    // Create a ZIP archive of all images
    const zipPath = path.join(__dirname, '../uploads', `${Date.now()}_jpgs.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', err => {
      console.error('Archive error:', err);
      throw err;
    });

    archive.pipe(output);

    imageFiles.forEach(imgPath => {
      archive.file(imgPath, { name: path.basename(imgPath) });
    });

    await archive.finalize();

    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log('Archive created successfully');
        resolve();
      });
      output.on('error', err => {
        console.error('Output stream error:', err);
        reject(err);
      });
    });

    // Set response headers to serve ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=pdf_pages.zip');
    res.setHeader('Content-Length', fs.statSync(zipPath).size);

    // Stream ZIP file to client
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);

    // Clean up after sending file
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(pdfPath);
      } catch {}
      imageFiles.forEach(img => {
        try { fs.unlinkSync(img); } catch {}
      });
      try {
        fs.rmdirSync(outputDir);
        fs.unlinkSync(zipPath);
      } catch {}
    });

  } catch (error) {
    console.error('PDF to JPG conversion error:', error);
    res.status(500).json({ error: 'Failed to convert PDF to JPG: ' + error.message });
  }
});;

// Add Page Numbers Route
router.post('/add-page-numbers', upload.single('pdf'), async (req, res) => {
  console.log('Add page numbers route accessed');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Get options from request body with defaults
    let {
      position = 'bottom-center', // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
      format = 'Page {n} of {total}', // {n} for current page, {total} for total pages
      fontSize = 12,
      color = '#000000', // hex color
      margin = 20 // margin from edge in points
    } = req.body;
fontSize = Number(fontSize);
margin = Number(margin);
    // Convert hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 0, g: 0, b: 0 };
    };
    const rgbColor = hexToRgb(color);

    // Calculate position coordinates
    const getPosition = (page, position) => {
      const { width, height } = page.getSize();
      switch (position) {
        case 'top-left':
          return { x: margin, y: height - margin };
        case 'top-center':
          return { x: width / 2, y: height - margin };
        case 'top-right':
          return { x: width - margin, y: height - margin };
        case 'bottom-left':
          return { x: margin, y: margin };
        case 'bottom-center':
          return { x: width / 2, y: margin };
        case 'bottom-right':
          return { x: width - margin, y: margin };
        default:
          return { x: width / 2, y: margin };
      }
    };

    // Embed font (you must embed font for drawText)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add page numbers to each page
    pages.forEach((page, index) => {
      const pageNumber = index + 1;
      const totalPages = pages.length;
      const text = format
        .replace('{n}', pageNumber)
        .replace('{total}', totalPages);

      let { x, y } = getPosition(page, position);

      // Adjust x for center and right align manually:
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      if (position.includes('center')) {
        x = x - textWidth / 2;
      } else if (position.includes('right')) {
        x = x - textWidth;
      }
      
      // Adjust y for top so text is not cut off:
      if (position.startsWith('top')) {
        y = y - fontSize;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
      });
    });

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=numbered.pdf');

    // Send the PDF
    res.send(Buffer.from(modifiedPdfBytes));

    // Clean up
    fs.unlinkSync(pdfPath);

  } catch (error) {
    console.error('Add page numbers error:', error);
    res.status(500).json({ 
      error: 'Failed to add page numbers: ' + error.message,
      details: error.stack
    });
  }
});

// HTML to PDF Route
router.post('/html-to-pdf', async (req, res) => {
  try {
    console.log('req.headers:', req.headers);
    console.log('req.body:', req.body);

    let html, fileName;
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        html = parsed.html;
        fileName = parsed.fileName;
      } catch (e) {
        html = req.body;
        fileName = 'converted';
      }
    } else if (req.body && typeof req.body === 'object') {
      html = req.body.html;
      fileName = req.body.fileName;
    } else {
      html = undefined;
      fileName = 'converted';
    }

    console.log('Parsed html:', html);

    if (!html) {
      console.log('No HTML content provided');
      return res.status(400).json({ error: 'No HTML content provided' });
    }

    // Launch Puppeteer
    let browser;
    try {
      console.log('Puppeteer executable path:', puppeteer.executablePath && puppeteer.executablePath());
      browser = await puppeteer.launch({
        executablePath: puppeteer.executablePath && puppeteer.executablePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (err) {
      console.error('Puppeteer launch error:', err);
      return res.status(500).json({ error: 'Failed to launch Puppeteer: ' + err.message });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate the PDF as a buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    console.log('PDF buffer size:', pdfBuffer.length);

    // Remove writing to disk (optional for debugging only)
    // fs.writeFileSync('debug-server.pdf', pdfBuffer);

    // Send the PDF buffer as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'converted'}.pdf"`);
    res.end(pdfBuffer); // Important: use res.end for binary data
  } catch (error) {
    console.error('HTML to PDF conversion error:', error);
    res.status(500).json({ error: 'Failed to convert HTML to PDF: ' + error.message });
  }
});

router.post('/organize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    let newOrder;
    if (typeof req.body.order === 'string') {
      try {
        newOrder = JSON.parse(req.body.order);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid order format' });
      }
    } else {
      newOrder = req.body.order;
    }
    if (!Array.isArray(newOrder) || newOrder.length === 0) {
      return res.status(400).json({ error: 'No page order provided' });
    }
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    // Validate order
    if (newOrder.some(idx => typeof idx !== 'number' || idx < 0 || idx >= totalPages)) {
      return res.status(400).json({ error: 'Invalid page indices in order' });
    }
    const newPdf = await PDFDocument.create();
    for (const idx of newOrder) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [idx]);
      newPdf.addPage(copiedPage);
    }
    const newPdfBytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reordered.pdf');
    res.send(Buffer.from(newPdfBytes));
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error('Organize PDF error:', error);
    res.status(500).json({ error: 'Failed to reorder PDF: ' + error.message });
  }
});
router.post('/ppt-to-pdf', upload.single('ppt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PPT file uploaded' });
  }

  const inputFile = req.file.path;
  const outputDir = path.resolve('uploads');

  const cmd = `soffice --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Conversion error:', stderr || error.message);
      // Delete uploaded file on error
      fs.unlink(inputFile, () => {});
      return res.status(500).json({ error: 'Failed to convert PPT to PDF' });
    }

    const pdfFilePath = path.join(
      outputDir,
      path.basename(inputFile, path.extname(inputFile)) + '.pdf'
    );

    res.download(pdfFilePath, (err) => {
      // Clean up files after sending response
      fs.unlink(inputFile, () => {});
      fs.unlink(pdfFilePath, () => {});
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  });
});
router.post('/excel-to-pdf', upload.single('excel'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No Excel file uploaded' });
  }

  const inputFile = req.file.path;
  const outputDir = path.resolve('uploads');

  // LibreOffice command to convert Excel to PDF
  const cmd = `soffice --headless --convert-to pdf "${inputFile}" --outdir "${outputDir}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('Conversion error:', stderr || error.message);
      fs.unlink(inputFile, () => {});
      return res.status(500).json({ error: 'Failed to convert Excel to PDF' });
    }

    const pdfFilePath = path.join(
      outputDir,
      path.basename(inputFile, path.extname(inputFile)) + '.pdf'
    );

    res.download(pdfFilePath, (err) => {
      // Clean up files after sending response
      fs.unlink(inputFile, () => {});
      fs.unlink(pdfFilePath, () => {});
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  });
});
router.post('/pdf-to-word', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const docxFileName = `${path.basename(pdfPath, path.extname(pdfPath))}.docx`;
    const docxPath = path.join('uploads', docxFileName);

    console.log('PDF uploaded at:', pdfPath);

    const pythonPath = './venv/bin/python'; // Adjust if your venv is in another location

    // Execute the Python script to convert PDF to DOCX
    exec(
      `${pythonPath} convert_pdf_to_docx.py ${pdfPath} ${docxPath}`,
      (error, stdout, stderr) => {
        console.log('Python stdout:', stdout);
        console.log('Python stderr:', stderr);

        // Check for errors
        if (error || !fs.existsSync(docxPath)) {
          console.error('Conversion error:', error || 'DOCX file not created');
          return res.status(500).json({ error: 'Failed to convert PDF to DOCX' });
        }

        // Send the DOCX file for download
        res.download(docxPath, path.basename(docxPath), (err) => {
          // Cleanup
          [pdfPath, docxPath].forEach((file) => {
            try {
              if (fs.existsSync(file)) fs.unlinkSync(file);
            } catch (err) {
              console.warn('Failed to delete:', file, err);
            }
          });

          if (err) {
            console.error('Download error:', err);
          } else {
            console.log('Conversion complete, file sent to client.');
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in /pdf-to-word:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/pdf-to-ppt', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const pdfPath = req.file.path;
  const imagesDir = path.join('uploads', `images_${Date.now()}`);
  fs.mkdirSync(imagesDir, { recursive: true });

  try {
    // Convert PDF pages to PNG images
    console.log('Converting PDF to images...');
    await new Promise((resolve, reject) => {
      const cmd = `pdftoppm -png ${pdfPath} ${path.join(imagesDir, 'page')}`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          reject(new Error('Failed to convert PDF to images.'));
        } else {
          resolve();
        }
      });
    });

    // Create a new PowerPoint
    let pptx = new PptxGenJS();

    // Add each PNG image as a slide
    const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png')).sort();

    if (images.length === 0) throw new Error('No images generated from PDF.');

    console.log(`Adding ${images.length} images to PPTX...`);

    images.forEach(imageFile => {
      const slide = pptx.addSlide();
      slide.addImage({
        path: path.join(imagesDir, imageFile),
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    });

    // Save PPTX to a file
    const pptxFileName = `${Date.now()}.pptx`;
    const pptxFilePath = path.join('uploads', pptxFileName);

    await pptx.writeFile({ fileName: pptxFilePath });

    // Send PPTX file
    res.download(pptxFilePath, 'converted.pptx', err => {
      // Cleanup
      [pdfPath, pptxFilePath].forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
      fs.rmSync(imagesDir, { recursive: true, force: true });
      if (err) console.error('Download error:', err);
    });
  } catch (err) {
    console.error('Error in /pdf-to-ppt:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/pdf-to-excel', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const pdfPath = path.resolve(req.file.path);

  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Basic example: extract text lines
    const lines = data.text.split('\n').filter(line => line.trim() !== '');
    
    // Example table extraction (assumes tab-delimited or space-delimited tables)
    const tableRows = lines.map(line =>
      line.trim().split(/\s{2,}|\t+/).join(',') // convert to CSV row
    );

    const csvContent = tableRows.join('\n');

    // Save to CSV file
    const csvPath = path.resolve('uploads', `${Date.now()}.csv`);
    fs.writeFileSync(csvPath, csvContent);

    // Send the CSV file
    res.download(csvPath, 'converted.csv', err => {
      if (err) console.error('Error sending file:', err);
      fs.unlink(pdfPath, () => {});
      fs.unlink(csvPath, () => {});
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to extract tables from PDF.' });
    fs.unlink(pdfPath, () => {});
  }
});
router.post('/pdf-to-pdfa', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;

    // Create output path: uploads/{fileName}_pdfa.pdf
    const pdfaPath = path.join(
      path.dirname(pdfPath),
      `${path.basename(pdfPath, path.extname(pdfPath))}_pdfa.pdf`
    );

    const gsCommand = `gs -dPDFA=2 -dBATCH -dNOPAUSE -dNOOUTERSAVE -sProcessColorModel=DeviceCMYK -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 -sOutputFile=${pdfaPath} ${pdfPath}`;
    console.log('Running ghostscript command:', gsCommand);

    // Run Ghostscript
    await new Promise((resolve, reject) => {
      exec(gsCommand, (err, stdout, stderr) => {
        if (err) {
          console.error('Ghostscript error:', stderr);
          return reject(new Error('Failed to convert to PDF/A'));
        }
        console.log('Ghostscript output:', stdout);
        resolve();
      });
    });

    // Verify output file exists
    if (!fs.existsSync(pdfaPath)) {
      throw new Error('PDF/A file not found');
    }

    // Send the converted file as response
    res.download(pdfaPath, 'converted_pdfa.pdf', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }

      // Clean up after sending
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(pdfaPath);
    });
  } catch (error) {
    console.error('Error in /pdf-to-pdfa:', error);
    res.status(500).json({ error: error.message || 'Failed to convert to PDF/A' });
  }
});
router.post('/compare-pdf', upload.fields([{ name: 'file1' }, { name: 'file2' }]), (req, res) => {
  if (!req.files || !req.files.file1 || !req.files.file2) {
    return res.status(400).json({ error: 'Please upload two PDF files.' });
  }

  const file1Path = req.files.file1[0].path;
  const file2Path = req.files.file2[0].path;
  const diffOutputPath = path.join('uploads', `${Date.now()}_diff.pdf`);

  // Run diff-pdf command to output differences to a PDF
  const cmd = `diff-pdf --output-diff=${diffOutputPath} ${file1Path} ${file2Path}`;

  exec(cmd, (error, stdout, stderr) => {
    // Clean up uploaded files after processing
    fs.unlinkSync(file1Path);
    fs.unlinkSync(file2Path);

    if (error) {
      // diff-pdf returns error if files differ, so we check stdout/stderr to distinguish error types
      if (stderr.includes('could not open')) {
        return res.status(500).json({ error: 'Error comparing PDFs.' });
      }
      // Files differ — send diff PDF back
      return res.download(diffOutputPath, 'diff.pdf', (err) => {
        if (!err) fs.unlinkSync(diffOutputPath); // remove diff after sending
      });
    } else {
      // Files are identical — no diff output created
      return res.json({ message: 'PDFs are identical.' });
    }
  });
});
router.post('/pdf-watermark', upload.single('pdf'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const watermarkText = req.body.watermark;

    // Load the PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 2 - watermarkText.length * 2.5,
        y: height / 2,
        size: 50,
        opacity: 0.3,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(45),
      });
    });

    // Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    const watermarkedPath = path.join(uploadDir, `watermarked_${req.file.filename}`);
    fs.writeFileSync(watermarkedPath, watermarkedPdfBytes);

    // Send file
    res.sendFile(watermarkedPath, () => {
      // Cleanup
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(watermarkedPath);
    });
  } catch (err) {
    console.error('Watermark error:', err);
    res.status(500).json({ error: 'Failed to add watermark' });
  }
});
router.post('/unlock-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath + '_unlocked.pdf';
  const password = req.body.password || '';

  // qpdf command to remove password (decrypt)
  // --password=PASSWORD : provide the password
  // --decrypt : remove encryption
  const cmd = `qpdf --password=${password} --decrypt ${inputPath} ${outputPath}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('qpdf error:', error);
      // Clean up
      fs.unlinkSync(inputPath);
      return res.status(400).json({ error: 'Failed to unlock PDF. Incorrect password or corrupted file.' });
    }

    // Send unlocked PDF file as response
    res.download(outputPath, 'unlocked.pdf', (err) => {
      // Clean up both files after sending
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  });
});
router.post('/protect-pdf', upload.single('pdf'), (req, res) => {
  const { password } = req.body;
  if (!password || !req.file) {
    return res.status(400).json({ error: 'PDF file and password are required.' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `protected_${Date.now()}.pdf`);

  // qpdf command to add password protection
  const command = `qpdf --encrypt ${password} ${password} 256 -- ${inputPath} ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    // Clean up the original file
    fs.unlinkSync(inputPath);

    if (error) {
      console.error('qpdf error:', error, stderr);
      return res.status(500).json({ error: 'Failed to protect PDF.' });
    }

    // Send back the protected PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=protected.pdf'
    });

    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res).on('finish', () => {
      // Clean up protected PDF file
      fs.unlinkSync(outputPath);
    });
  });
});
router.post('/word-to-pdf', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath + '.pdf';

  // Read the Word file
  const fileBuffer = fs.readFileSync(inputPath);

  // Convert to PDF (output format: pdf)
  libre.convert(fileBuffer, '.pdf', undefined, (err, done) => {
    // Delete the uploaded docx file after conversion
    fs.unlinkSync(inputPath);

    if (err) {
      console.error(`Error converting file: ${err}`);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    // Save converted PDF temporarily
    fs.writeFileSync(outputPath, done);

    // Send the PDF file to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(req.file.originalname).name}.pdf"`);

    // Read PDF and pipe to response
    const pdfStream = fs.createReadStream(outputPath);
    pdfStream.pipe(res);

    // Delete the temporary PDF file after sending response
    pdfStream.on('close', () => {
      fs.unlinkSync(outputPath);
    });
  });
});

router.post('/pdf-to-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Read the uploaded file as Buffer
    const pdfBuffer = fs.readFileSync(req.file.path);

    // Parse the PDF buffer to extract text
    const data = await pdfParse(pdfBuffer);

    // Cleanup the uploaded file
    fs.unlinkSync(req.file.path);

    // Send extracted text as plain text response
    res.setHeader('Content-Disposition', 'attachment; filename=converted.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.send(data.text);

  } catch (error) {
    console.error('PDF to text conversion error:', error);
    res.status(500).json({ error: 'Failed to convert PDF to text' });
  }
});
router.post('/update-metadata', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Update metadata
    if (req.body.title) pdfDoc.setTitle(req.body.title);
    if (req.body.author) pdfDoc.setAuthor(req.body.author);
    if (req.body.subject) pdfDoc.setSubject(req.body.subject);
    if (req.body.keywords) {
      const keywords = req.body.keywords.split(',').map(k => k.trim());
      pdfDoc.setKeywords(keywords);
    }

    const updatedPdfBytes = await pdfDoc.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Set correct headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="updated.pdf"',
      'Content-Length': updatedPdfBytes.length,
    });

    return res.end(updatedPdfBytes);
  } catch (error) {
    console.error('Error updating PDF metadata:', error);
    res.status(500).json({ error: 'Failed to update PDF metadata' });
  }
});
router.post('/view-metadata', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded.' });
  }

  try {
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const metadata = pdfDoc.getTitle() || pdfDoc.getAuthor() || pdfDoc.getSubject() || pdfDoc.getKeywords()
      ? {
          title: pdfDoc.getTitle(),
          author: pdfDoc.getAuthor(),
          subject: pdfDoc.getSubject(),
          keywords: pdfDoc.getKeywords(),
          creator: pdfDoc.getCreator(),
          producer: pdfDoc.getProducer(),
          creationDate: pdfDoc.getCreationDate(),
          modificationDate: pdfDoc.getModificationDate(),
        }
      : { message: 'No metadata found in this PDF.' };

    res.json({ metadata });
  } catch (error) {
    console.error('Error extracting metadata:', error);
    res.status(500).json({ error: 'Failed to extract metadata.' });
  } finally {
    fs.unlinkSync(req.file.path); // Clean up the uploaded file
  }
});
router.post("/pdf-to-speech", upload.single("file"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    const text = data.text.slice(0, 5000) || "No readable text in PDF.";
    const tts = new gTTS(text, "en"); // You can change language dynamically

    const outputFile = "output.mp3";
    tts.save(outputFile, () => {
      res.download(outputFile, "pdf_audio.mp3", () => {
        fs.unlinkSync(outputFile);
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
function extractTextBlocks(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new pdf2json();

    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      if (!pdfData.formImage || !pdfData.formImage.Pages) {
        return resolve([]); // empty array if no text layer
      }

      const pages = pdfData.formImage.Pages;
      let blocks = [];

      pages.forEach((page, pageIndex) => {
        if (!page.Texts) return;
        page.Texts.forEach(t => {
          const text = t.R && t.R[0] ? decodeURIComponent(t.R[0].T) : "";
          blocks.push({
            text,
            x: t.x,
            y: t.y,
            w: t.w,
            sw: t.sw,
            pageIndex
          });
        });
      });

      resolve(blocks);
    });

    pdfParser.loadPDF(filePath);
  });
}

// Function to extract text via OCR using pdf2pic + Tesseract
async function extractTextWithOCR(filePath) {
  const converter = fromPath(filePath, {
    density: 150,
    format: "png",
    width: 1200,
    height: 1600
  });

  const pdfBuffer = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  const texts = [];
  for (let i = 0; i < pages.length; i++) {
    const imagePath = await converter(i + 1, { savePath: "/tmp" });
    const { data: { text } } = await Tesseract.recognize(imagePath.path, "eng", { logger: m => console.log(m) });
    texts.push({ text, pageIndex: i });
  }
  return texts;
}

// Main route
router.post("/translate", upload.single("pdf"), async (req, res) => {
  try {
    const { lang: targetLang } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF uploaded" });
    }

    // Step 1: Extract text blocks via pdf2json
    let blocks = await extractTextBlocks(req.file.path);

    // Step 1b: If pdf2json fails, fallback to OCR
    if (blocks.length === 0) {
      console.log("Falling back to OCR...");
      const ocrBlocks = await extractTextWithOCR(req.file.path);
      blocks = ocrBlocks.map(b => ({
        text: b.text,
        x: 10,       // default position for OCR
        y: 10,       // default position for OCR
        w: 500,
        sw: 0,
        pageIndex: b.pageIndex
      }));
    }

    if (blocks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "PDF has no extractable text even after OCR"
      });
    }

    // Step 2: Translate each block
    const translatedBlocks = [];
    for (let block of blocks) {
      if (!block.text.trim()) {
        translatedBlocks.push(block);
        continue;
      }
      const result =  await gtranslate.translate(block.text, { to: targetLang });
      translatedBlocks.push({ ...block, text: result.text });
    }

    // Step 3: Build new PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = fs.readFileSync(FONT_PATH);
    const customFont = await pdfDoc.embedFont(fontBytes);

    let currentPageIndex = -1;
    let page;

    for (let block of translatedBlocks) {
      if (block.pageIndex !== currentPageIndex) {
        page = pdfDoc.addPage([600, 800]);
        currentPageIndex = block.pageIndex;
      }

      const scaleX = 6.5;
      const scaleY = 7.5;

      const x = block.x * scaleX;
      const y = page.getHeight() - block.y * scaleY;

      page.drawText(block.text, {
        x,
        y,
        size: 12,
        font: customFont,
        color: rgb(0, 0, 0),
        maxWidth: 500
      });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=translated.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
});


router.post("/handwrite", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF uploaded" });
    }

    // Step 1: Extract text from PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const originalText = pdfData.text || "No text found";

    // Step 2: Create new PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([600, 800]);

    // ✅ Use handwriting font
    const fontPath = path.join(__dirname, "../fonts/Caveat-Regular.ttf"); // put font inside /fonts
    const fontBytes = fs.readFileSync(fontPath);
    const handwritingFont = await pdfDoc.embedFont(fontBytes);

    const fontSize = 18;
    const { height } = page.getSize();

    // Step 3: Draw "handwritten" styled text
    page.drawText(originalText, {
      x: 50,
      y: height - 80,
      size: fontSize,
      font: handwritingFont,
      color: rgb(0.1, 0.1, 0.1),
      lineHeight: 22,
      maxWidth: 500,
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=handwritten.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// POST /pdf-expire

router.post("/pdf-expire", upload.single("file"), async (req, res) => {
  try {
    const { days } = req.body;
    if (!days) return res.status(400).json({ success: false, message: "Days required" });

    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(days));

    await Sharelinks.create({
      token,
      filePath: req.file.path,
      expiresAt
    });

    const shareUrl = `${req.protocol}://${req.get("host")}/api/share/${token}`;
    return res.json({ success: true, url: shareUrl, expiresAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Serve file if not expired
router.get("/share/:token", async (req, res) => {
  try {
    const link = await Sharelinks.findOne({ token: req.params.token });
    if (!link) return res.status(404).send("Link not found");
    if (new Date() > link.expiresAt) return res.status(410).send("Link expired");

    const filePath = path.resolve(link.filePath);

    // ✅ Set headers to show inline & discourage download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline"); // "inline" opens in browser
    res.setHeader("Cache-Control", "no-store"); // prevent caching

    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.post(
  "/sign",
  upload.fields([{ name: "pdf", maxCount: 1 }, { name: "images" }, { name: "signatures" }]),
  async (req, res) => {
    try {
      const pdfFile = req.files["pdf"][0];
      const placements = JSON.parse(req.body.placements);

      const pdfBytes = fs.readFileSync(pdfFile.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const p of placements) {
        const page = pages[p.page];
        if (!page) continue;
        const adjustedY = page.getHeight() - p.y - (p.height || 0);

        if (p.type === "image") {
          const imgBytes = fs.readFileSync(req.files["images"][0].path);
          const pngImage = await pdfDoc.embedPng(imgBytes);
          page.drawImage(pngImage, { x: p.x, y: adjustedY, width: p.width, height: p.height });
        } else if (p.type === "signature" && p.signatureData) {
          const data = p.signatureData.split(",")[1];
          const sigBytes = Buffer.from(data, "base64");
          const pngImage = await pdfDoc.embedPng(sigBytes);
          page.drawImage(pngImage, { x: p.x, y: adjustedY, width: p.width, height: p.height });
        } else if (p.type === "text") {
          page.drawText(p.text || "", { x: p.x, y: adjustedY, size: 14, font, color: rgb(0, 0, 0) });
        }
      }

      const signedPdf = await pdfDoc.save();
      fs.unlinkSync(pdfFile.path);

      res.set({ "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=signed.pdf" });
      res.send(Buffer.from(signedPdf));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to sign PDF" });
    }
  }
);

const fontUrls = {
  "'Great Vibes', cursive": "https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf",
  "'Merriweather', serif": "https://raw.githubusercontent.com/google/fonts/main/ofl/merriweather/Merriweather-Regular.ttf",
  "'Montserrat', sans-serif": "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Regular.ttf",
  "'Dancing Script', cursive": "https://raw.githubusercontent.com/google/fonts/main/ofl/dancingscript/DancingScript-Regular.ttf",
  "'Satisfy', cursive": "https://raw.githubusercontent.com/google/fonts/main/ofl/satisfy/Satisfy-Regular.ttf",
  "'Pacifico', cursive": "https://raw.githubusercontent.com/google/fonts/main/ofl/pacifico/Pacifico-Regular.ttf"
};

// Function to download font
const downloadFont = async (fontName, fontUrl) => {
  const fontsDir = path.join(__dirname, '../fonts');
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }
  
  const fontPath = path.join(fontsDir, `${fontName.replace(/[^\w]/g, '')}.ttf`);
  
  // Check if font already exists
  if (fs.existsSync(fontPath)) {
    console.log(`Font already exists: ${fontName}`);
    return fontPath;
  }
  
  try {
    console.log(`Downloading font: ${fontName} from ${fontUrl}`);
    const response = await axios({
      method: 'GET',
      url: fontUrl,
      responseType: 'arraybuffer',
      timeout: 30000,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Only resolve for 2xx status
      }
    });
    
    // Verify it's actually a font file (check first few bytes)
    const buffer = Buffer.from(response.data);
    if (buffer.length < 100) {
      throw new Error('Downloaded file too small - likely not a font file');
    }
    
    fs.writeFileSync(fontPath, buffer);
    console.log(`Successfully downloaded font: ${fontName}`);
    return fontPath;
  } catch (error) {
    console.error(`Failed to download font ${fontName}:`, error.message);
    // Don't throw, just return null so we can use fallback fonts
    return null;
  }
};

router.post(
  "/sign-PDF",
  upload.fields([
    { name: "pdf", maxCount: 1 }, 
    { name: "images" }, 
    { name: "signatures" }
  ]),
  async (req, res) => {
    try {
      const pdfFile = req.files["pdf"][0];
      const placements = JSON.parse(req.body.placements || "[]");
      
      console.log("Received placements:", placements);
      console.log("Received images:", req.files["images"] ? req.files["images"].map(img => ({
        originalname: img.originalname,
        fieldname: img.fieldname,
        size: img.size
      })) : []);
      console.log("Received signatures:", req.files["signatures"] ? req.files["signatures"].length : 0);

      const pdfBytes = fs.readFileSync(pdfFile.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Register fontkit for custom fonts
      pdfDoc.registerFontkit(fontkit);
      
      const pages = pdfDoc.getPages();
      
      // Load default fonts as fallback
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      // Store loaded fonts to avoid reloading
      const loadedFonts = {};

      // Function to convert hex color to RGB
      const hexToRgb = (hex) => {
        hex = hex.replace(/^#/, '');
        let r, g, b;
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16) / 255;
          g = parseInt(hex[1] + hex[1], 16) / 255;
          b = parseInt(hex[2] + hex[2], 16) / 255;
        } else if (hex.length === 6) {
          r = parseInt(hex.slice(0, 2), 16) / 255;
          g = parseInt(hex.slice(2, 4), 16) / 255;
          b = parseInt(hex.slice(4, 6), 16) / 255;
        } else {
          r = g = b = 0;
        }
        return { r, g, b };
      };

      // Create a map of image files for easier lookup - use fieldname as key
      const imageMap = new Map();
      if (req.files["images"]) {
        req.files["images"].forEach(img => {
          // Use the fieldname as key (this is what FormData uses)
          imageMap.set(img.fieldname, img);
          console.log(`Mapped image - Fieldname: ${img.fieldname}, Original: ${img.originalname}`);
        });
      }

      // Also map by original filename without extension for fallback
      const imageNameMap = new Map();
      if (req.files["images"]) {
        req.files["images"].forEach(img => {
          const nameWithoutExt = path.parse(img.originalname).name;
          imageNameMap.set(nameWithoutExt, img);
        });
      }

      // Process each placement
      for (const p of placements) {
        const page = pages[p.page];
        if (!page) {
          console.warn(`Page ${p.page} not found, skipping placement`);
          continue;
        }

        // Adjust Y coordinate (PDF coordinates are from bottom)
        const adjustedY = page.getHeight() - p.y - (p.height || 0);

        try {
          if (p.type === "image") {
            console.log(`Processing image placement - ID: ${p.id}, Type: ${p.type}`);
            
            let imageFile = null;

            // Method 1: Try to find by the placement ID as fieldname
            if (p.id) {
              imageFile = imageMap.get(p.id);
            }

            // Method 2: Try to find by imageFileName if provided
            if (!imageFile && p.imageFileName) {
              const searchName = path.parse(p.imageFileName).name;
              imageFile = imageNameMap.get(searchName);
            }

            // Method 3: Fallback - use first available image if only one exists
            if (!imageFile && req.files["images"] && req.files["images"].length === 1) {
              imageFile = req.files["images"][0];
              console.log(`Using single available image as fallback: ${imageFile.originalname}`);
            }

            // Method 4: Try partial matching on fieldname
            if (!imageFile && p.id) {
              for (const [fieldname, img] of imageMap.entries()) {
                if (fieldname.includes(p.id) || p.id.includes(fieldname)) {
                  imageFile = img;
                  break;
                }
              }
            }

            if (imageFile) {
              console.log(`Found matching image: ${imageFile.originalname} for placement: ${p.id}`);
              try {
                const imgBytes = fs.readFileSync(imageFile.path);
                
                // Determine image type and embed accordingly
                let image;
                if (imageFile.mimetype === 'image/png' || imageFile.originalname.endsWith('.png')) {
                  image = await pdfDoc.embedPng(imgBytes);
                  console.log(`Embedded as PNG image`);
                } else if (imageFile.mimetype === 'image/jpeg' || imageFile.originalname.endsWith('.jpg') || imageFile.originalname.endsWith('.jpeg')) {
                  image = await pdfDoc.embedJpg(imgBytes);
                  console.log(`Embedded as JPG image`);
                } else {
                  // Default to PNG for other types
                  image = await pdfDoc.embedPng(imgBytes);
                  console.log(`Embedded as default PNG image`);
                }
                
                page.drawImage(image, { 
                  x: p.x, 
                  y: adjustedY, 
                  width: p.width || 100, 
                  height: p.height || 100 
                });
                console.log(`Successfully drew image at x:${p.x}, y:${adjustedY}, width:${p.width}, height:${p.height}`);
              } catch (embedError) {
                console.error(`Error embedding image ${p.id}:`, embedError);
                // Draw a placeholder rectangle for debugging
                page.drawRectangle({
                  x: p.x,
                  y: adjustedY,
                  width: p.width || 100,
                  height: p.height || 100,
                  color: rgb(1, 0, 0),
                  opacity: 0.3,
                });
                page.drawText(`IMAGE ERROR: ${embedError.message}`, {
                  x: p.x,
                  y: adjustedY,
                  size: 8,
                  color: rgb(1, 0, 0),
                });
              }
            } else {
              console.warn(`No image file found for placement: ${p.id}`);
              console.log('Available images:', Array.from(imageMap.entries()));
              
              // Draw a placeholder for missing images
              page.drawRectangle({
                x: p.x,
                y: adjustedY,
                width: p.width || 100,
                height: p.height || 100,
                color: rgb(0.8, 0.8, 0.8),
                opacity: 0.5,
              });
              page.drawText(`Missing: ${p.id}`, {
                x: p.x,
                y: adjustedY + (p.height || 100) / 2,
                size: 10,
                color: rgb(0, 0, 0),
              });
            }
          } 
          else if (p.type === "signature") {
            // Handle signature placements
            if (p.signatureData && p.signatureData.startsWith('data:')) {
              try {
                const base64Data = p.signatureData.split(',')[1];
                const sigBytes = Buffer.from(base64Data, 'base64');
                const signatureImage = await pdfDoc.embedPng(sigBytes);
                page.drawImage(signatureImage, { 
                  x: p.x, 
                  y: adjustedY, 
                  width: p.width || 150, 
                  height: p.height || 80 
                });
                console.log(`Drawn signature at x:${p.x}, y:${adjustedY}`);
              } catch (sigError) {
                console.error("Error embedding signature:", sigError);
                // Fallback to text signature
                page.drawText("Signature", {
                  x: p.x,
                  y: adjustedY,
                  size: p.fontSize || 14,
                  font: helveticaFont,
                  color: rgb(0, 0, 0)
                });
              }
            }
          } 
          else if (p.type === "fullName" || p.type === "initials" || p.type === "freeText") {
            // Handle text placements with proper fonts and colors
            const text = p.text || (p.type === "freeText" ? "" : "Sample Text");
            const fontSize = p.fontSize || (p.type === "freeText" ? 16 : 24);
            const fontFamily = p.fontFamily || "'Montserrat', sans-serif";
            const color = p.color || "#000000";
            
            // Skip empty freeText
            if (p.type === "freeText" && !text.trim()) {
              console.log(`Skipping empty freeText placement: ${p.id}`);
              continue;
            }
            
            let fontToUse = helveticaFont; // Default font
            
            try {
              // Check if font is already loaded
              if (!loadedFonts[fontFamily]) {
                const fontUrl = fontUrls[fontFamily];
                if (fontUrl) {
                  const fontPath = await downloadFont(fontFamily, fontUrl);
                  if (fontPath && fs.existsSync(fontPath)) {
                    console.log(`Loading font from: ${fontPath}`);
                    const fontBytes = fs.readFileSync(fontPath);
                    loadedFonts[fontFamily] = await pdfDoc.embedFont(fontBytes);
                    console.log(`Successfully loaded font: ${fontFamily}`);
                  } else {
                    console.warn(`Could not download font: ${fontFamily}`);
                    loadedFonts[fontFamily] = null;
                  }
                } else {
                  console.warn(`No URL found for font: ${fontFamily}`);
                  loadedFonts[fontFamily] = null;
                }
              }
              
              if (loadedFonts[fontFamily]) {
                fontToUse = loadedFonts[fontFamily];
                console.log(`Using custom font: ${fontFamily}`);
              } else {
                // Fallback font selection
                console.log(`Using fallback font for: ${fontFamily}`);
                if (fontFamily.includes('Great Vibes') || fontFamily.includes('Dancing Script') || 
                    fontFamily.includes('Satisfy') || fontFamily.includes('Pacifico')) {
                  fontToUse = helveticaOblique;
                } else if (fontFamily.includes('Merriweather')) {
                  fontToUse = helveticaBold;
                }
              }
            } catch (fontError) {
              console.error("Error loading custom font:", fontError);
              // Continue with default font
            }

            // Convert color to RGB
            const rgbColor = hexToRgb(color);

            // For freeText, we might want to handle text wrapping differently
            const options = {
              x: p.x,
              y: adjustedY,
              size: fontSize,
              font: fontToUse,
              color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            };

            // Add maxWidth for text wrapping if width is specified
            if (p.width && p.width > 0) {
              options.maxWidth = p.width;
            }

            page.drawText(text, options);
            
            console.log(`Drew ${p.type}: "${text}" with font: ${fontFamily}, color: ${color}, size: ${fontSize}`);
          }
        } catch (placementError) {
          console.error(`Error processing placement ${p.id}:`, placementError);
          // Draw error indicator for debugging
          page.drawRectangle({
            x: p.x,
            y: adjustedY,
            width: p.width || 100,
            height: p.height || 30,
            color: rgb(1, 0, 0),
            opacity: 0.2,
          });
          page.drawText(`ERROR: ${placementError.message}`, {
            x: p.x,
            y: adjustedY,
            size: 6,
            color: rgb(1, 0, 0),
          });
        }
      }

      // Save the signed PDF
      const signedPdfBytes = await pdfDoc.save();
      
      // Clean up uploaded files
      try {
        fs.unlinkSync(pdfFile.path);
        
        if (req.files["images"]) {
          req.files["images"].forEach(img => {
            try { fs.unlinkSync(img.path); } catch (e) {}
          });
        }
        
        if (req.files["signatures"]) {
          req.files["signatures"].forEach(sig => {
            try { fs.unlinkSync(sig.path); } catch (e) {}
          });
        }
      } catch (cleanupError) {
        console.warn("Error during file cleanup:", cleanupError);
      }

      // Send the signed PDF
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=signed-document.pdf",
        "Content-Length": signedPdfBytes.length
      });
      
      res.send(Buffer.from(signedPdfBytes));
      console.log("PDF successfully generated and sent");
      
    } catch (err) {
      console.error("PDF signing error:", err);
      res.status(500).json({ 
        error: "Failed to sign PDF",
        details: err.message 
      });
    }
  }
);

module.exports = router;
