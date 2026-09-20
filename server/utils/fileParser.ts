export function sniffMimeType(buffer: Buffer): 'pdf' | 'docx' | 'unknown' {
  if (!buffer || buffer.length < 4) return 'unknown';

  // PDF Magic Bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'pdf';
  }

  // DOCX / Zip Magic Bytes: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return 'docx';
  }

  return 'unknown';
}

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const mimeType = sniffMimeType(buffer);

  if (mimeType === 'unknown') {
    throw new Error('INVALID_FILE_FORMAT: File content magic bytes do not match PDF or DOCX format.');
  }

  // Simple, robust in-memory text extractor
  const textContent = buffer.toString('utf-8', 0, Math.min(buffer.length, 500000));

  // Extract printable text characters, lines, and words
  const sanitizedText = textContent
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (sanitizedText.length < 20) {
    // If raw binary text extraction yielded too little text (e.g. compressed PDF),
    // extract readable ascii chunks from the buffer
    const asciiChunks: string[] = [];
    let currentChunk = '';
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
        currentChunk += String.fromCharCode(byte);
      } else {
        if (currentChunk.trim().length > 3) {
          asciiChunks.push(currentChunk.trim());
        }
        currentChunk = '';
      }
    }
    if (currentChunk.trim().length > 3) asciiChunks.push(currentChunk.trim());
    return asciiChunks.join(' ');
  }

  return sanitizedText;
}
