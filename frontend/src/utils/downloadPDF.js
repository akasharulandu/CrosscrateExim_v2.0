import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Make sure logo is accessible publicly or imported as base64
import logo from '../assets/crosscrate-logo.png'; // adjust this path as needed

export const downloadPDF = async (elementId, productTitle) => {
  const input = document.getElementById(elementId);

  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Add company logo to header
  const logoWidth = 30;
  const logoHeight = 30;
  const logoX = 10;
  const logoY = 10;
  pdf.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Company name and contact details next to logo
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Crosscrate International Exim', logoX + logoWidth + 10, 20);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Phone: +91 98765 43210', logoX + logoWidth + 10, 27);
  pdf.text('Email: contact@crosscrate.com', logoX + logoWidth + 10, 32);
  pdf.text('Website: www.crosscrate.com', logoX + logoWidth + 10, 37);
  pdf.text('Al Ameen, Parimanam, Muttom-Allepey, Kerala, India- 690511', logoX + logoWidth + 10, 42);

  // Add a line separator
  pdf.setLineWidth(0.5);
  pdf.line(10, 47, pageWidth - 10, 47);

  // Add product title
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Product Details:', 10, 55);
  pdf.setFontSize(12);
  pdf.text(productTitle || 'Product Information', 10, 62);

  // Add captured HTML content below header and title
  const contentY = 70;
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth - 20;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 10, contentY, pdfWidth, pdfHeight);

  // Save the PDF with product name
  pdf.save(`${productTitle || 'Product_Details'}.pdf`);
};
