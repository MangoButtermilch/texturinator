// heightmap-png-encoder.ts

export async function encodeGrayscale16PNG(
    width: number,
    height: number,
    data: Uint16Array  // bereits Y-geflippt, Werte 0–65535
): Promise<Uint8Array> {

    // --- Scanlines bauen: 1 Filter-Byte (0 = None) + 2 Bytes pro Pixel (Big Endian) ---
    const scanlineLength = 1 + width * 2;
    const raw = new Uint8Array(height * scanlineLength);

    for (let y = 0; y < height; y++) {
        raw[y * scanlineLength] = 0; // Filter: None
        for (let x = 0; x < width; x++) {
            const val = data[y * width + x];
            raw[y * scanlineLength + 1 + x * 2] = (val >> 8) & 0xff; // high byte
            raw[y * scanlineLength + 1 + x * 2 + 1] = val & 0xff; // low byte
        }
    }

    // --- zlib-Compress (PNG IDAT braucht zlib, nicht raw deflate) ---
    const compressed = await zlibDeflate(raw);

    // --- Chunks zusammenbauen ---
    const chunks: Uint8Array[] = [
        PNG_SIGNATURE,
        makeChunk('IHDR', makeIHDR(width, height)),
        makeChunk('IDAT', compressed),
        makeChunk('IEND', new Uint8Array(0)),
    ];

    return concatBytes(chunks);
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function makeIHDR(width: number, height: number): Uint8Array {
    const buf = new DataView(new ArrayBuffer(13));
    buf.setUint32(0, width);
    buf.setUint32(4, height);
    buf.setUint8(8, 16); // bit depth
    buf.setUint8(9, 0); // color type: Grayscale
    buf.setUint8(10, 0); // compression
    buf.setUint8(11, 0); // filter
    buf.setUint8(12, 0); // interlace: none
    return new Uint8Array(buf.buffer);
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
    const typeBytes = new TextEncoder().encode(type);
    const length = new DataView(new ArrayBuffer(4));
    length.setUint32(0, data.length);

    // CRC über type + data
    const crcInput = new Uint8Array(4 + data.length);
    crcInput.set(typeBytes, 0);
    crcInput.set(data, 4);
    const crcVal = new DataView(new ArrayBuffer(4));
    crcVal.setUint32(0, crc32(crcInput));

    return concatBytes([
        new Uint8Array(length.buffer),
        typeBytes,
        data,
        new Uint8Array(crcVal.buffer),
    ]);
}

async function zlibDeflate(data: any): Promise<Uint8Array> {
    const cs = new CompressionStream('deflate'); // zlib-wrapped
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = cs.readable.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return concatBytes(chunks);
}

function concatBytes(arrays: Uint8Array[]): Uint8Array {
    const total = arrays.reduce((n, a) => n + a.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) {
        result.set(a, offset);
        offset += a.length;
    }
    return result;
}

// CRC32-Tabelle (einmalig generiert)
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
    }
    return t;
})();

function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}