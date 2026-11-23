/** Retail barcodes only: what packaged food carries. */
const FORMATS = ['ean_13', 'ean_8', 'upc_a'];

type Detector = { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> };
type NativeDetector = {
  new (options: { formats: string[] }): Detector;
  getSupportedFormats(): Promise<string[]>;
};

/** True for an 8, 12, 13 or 14 digit code whose final check digit adds up. */
export function isValidBarcode(code: string): boolean {
  if (!/^(?:\d{8}|\d{12,14})$/.test(code)) return false;
  const sum = [...code]
    .reverse()
    .map(Number)
    .reduce((total, digit, index) => total + digit * (index % 2 ? 3 : 1), 0);
  return sum % 10 === 0;
}

let detector: Promise<Detector> | null = null;

/** The browser's own scanner where it exists (Android Chrome); a bundled one elsewhere (iPhone Safari). */
export function getBarcodeDetector(): Promise<Detector> {
  detector ??= createDetector().catch((error) => {
    detector = null;
    throw error;
  });
  return detector;
}

async function createDetector(): Promise<Detector> {
  const Native = (window as { BarcodeDetector?: NativeDetector }).BarcodeDetector;
  if (Native) {
    try {
      const supported = await Native.getSupportedFormats();
      const formats = FORMATS.filter((format) => supported.includes(format));
      if (formats.length) return new Native({ formats });
    } catch {
      // Fall through to the bundled scanner.
    }
  }

  const [{ BarcodeDetector, prepareZXingModule }, wasm] = await Promise.all([
    import('barcode-detector/ponyfill'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ]);
  // Serve the scanner from our own build instead of a public CDN.
  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasm.default : prefix + path),
    },
  });
  return new BarcodeDetector({ formats: FORMATS as ('ean_13' | 'ean_8' | 'upc_a')[] });
}
