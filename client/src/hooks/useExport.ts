import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useExport() {
  const exportPng = async (element: HTMLElement, filename: string) => {
    const canvas = await html2canvas(element, {
      backgroundColor: '#FFFFFF',
      scale: 2,
    });
    canvas.toBlob(blob => {
      if (blob) downloadBlob(blob, `${filename}.png`);
    });
  };

  const exportSvg = (element: HTMLElement, filename: string) => {
    const svgEl = element.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${filename}.svg`);
  };

  const exportPdf = async (element: HTMLElement, filename: string) => {
    const canvas = await html2canvas(element, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  };

  const exportPptx = async (elements: { element: HTMLElement; title: string }[], filename: string) => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText('TF Capacity Management Dashboard', {
      x: 0.5, y: 1.5, w: '90%', h: 1.5,
      fontSize: 36, fontFace: 'Arial', color: '002B5C',
      bold: true, align: 'center',
    });
    titleSlide.addText(new Date().toLocaleDateString(), {
      x: 0.5, y: 3.5, w: '90%', h: 0.5,
      fontSize: 14, fontFace: 'Arial', color: '666666',
      align: 'center',
    });

    for (const { element, title } of elements) {
      const canvas = await html2canvas(element, {
        backgroundColor: '#FFFFFF',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const slide = pptx.addSlide();

      slide.addText(title, {
        x: 0.3, y: 0.2, w: '90%', h: 0.5,
        fontSize: 20, fontFace: 'Arial', color: '002B5C',
        bold: true,
      });

      // Calculate dimensions to fit slide
      const maxW = 12.5;
      const maxH = 6.0;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;

      slide.addImage({
        data: imgData,
        x: (13.33 - w) / 2,
        y: 0.9,
        w,
        h,
      });
    }

    const blob = await pptx.write({ outputType: 'blob' }) as Blob;
    downloadBlob(blob, `${filename}.pptx`);
  };

  return { exportPng, exportSvg, exportPdf, exportPptx };
}
