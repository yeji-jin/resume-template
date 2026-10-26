import type { PDFDocumentProxy } from "pdfjs-dist";

export async function openPdf(blob: Blob) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url,
  ).toString();
  return pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
}

/** PDF.js only paints already-paginated PDF pages. It does not lay out resumes. */
export async function renderPdfPage(document: PDFDocumentProxy, number: number, scale: number) {
  const page = await document.getPage(number);
  const viewport = page.getViewport({ scale });
  const canvas = window.document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, viewport }).promise;
  return canvas;
}

export async function pdfToPng(blob: Blob, scale: number) {
  const document = await openPdf(blob);
  try {
    const first = await renderPdfPage(document, 1, scale);
    const canvas = window.document.createElement("canvas");
    canvas.width = first.width;
    canvas.height = first.height * document.numPages;

    // Browsers cannot create an infinitely tall canvas.
    if (canvas.height > 32767 || canvas.width * canvas.height > 100_000_000) {
      throw new Error("문서가 PNG 한 장으로 저장하기에 너무 깁니다. 일반 화질 또는 PDF로 저장해 주세요.");
    }

    const context = canvas.getContext("2d");
    if (!context) throw new Error("이미지를 만들 수 없습니다.");
    context.drawImage(first, 0, 0);

    for (let number = 2; number <= document.numPages; number++) {
      const page = await renderPdfPage(document, number, scale);
      context.drawImage(page, 0, first.height * (number - 1));
      page.width = page.height = 0;
    }

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((image) => {
        canvas.width = canvas.height = 0;
        if (image) resolve(image);
        else reject(new Error("이미지를 저장하지 못했습니다. PDF로 저장해 주세요."));
      }, "image/png");
    });
  } finally {
    await document.loadingTask.destroy();
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to consume the URL before releasing its memory.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
