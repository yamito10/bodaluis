import Tesseract from 'tesseract.js';

export async function extractPaymentInfo(file: File) {
  try {
    const result = await Tesseract.recognize(file, 'spa', {
      logger: m => console.log(m)
    });
    
    const text = result.data.text;
    console.log("Extracted text:", text);
    
    let monto = null;
    let fecha = null;
    let codigoAutorizacion = null;
    
    // Buscamos monto (ej. $1,200.50 o $ 1200.50)
    const montoMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (montoMatch) {
      monto = parseFloat(montoMatch[1].replace(/,/g, ''));
    } else {
      const totalMatch = text.match(/(?:monto|total|importe)[\s:]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
      if (totalMatch) {
        monto = parseFloat(totalMatch[1].replace(/,/g, ''));
      }
    }
    
    // Buscamos fecha (ej. 12/03/2026, 12-03-2026)
    const fechaMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})/);
    if (fechaMatch) {
      const year = fechaMatch[3].length === 2 ? `20${fechaMatch[3]}` : fechaMatch[3];
      // Asumiendo formato DD/MM/YYYY
      fecha = `${year}-${fechaMatch[2]}-${fechaMatch[1]}`;
    }
    
    // Buscamos código de autorización o folio
    const authMatch = text.match(/(?:autorizaci[oó]n|folio|movimiento|rastreo|aut)[\s:.]*([A-Z0-9]{6,})/i);
    if (authMatch) {
      codigoAutorizacion = authMatch[1];
    }
    
    return {
      monto,
      fecha,
      codigoAutorizacion
    };
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract information from image.");
  }
}
