import jsPDF from 'jspdf';

interface PDFOptions {
  title: string;
  content: string;
  modelUsed?: string;
  filename: string;
}

export const generatePDF = ({ title, content, modelUsed, filename }: PDFOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let metaY = 28;
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, metaY, { align: 'center' });
  
  if (modelUsed) {
    metaY += 6;
    doc.text(`Model: ${modelUsed}`, pageWidth / 2, metaY, { align: 'center' });
  }
  
  // Content
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, maxWidth);
  
  let y = metaY + 12;
  lines.forEach((line: string) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 6;
  });
  
  // Footer with page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  doc.save(filename);
};
