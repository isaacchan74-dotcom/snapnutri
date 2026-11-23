import { useEffect, useRef, useState, type FormEvent } from 'react';

import { lookupProduct } from '../api/products';
import { getBarcodeDetector, isValidBarcode } from '../lib/barcode';
import type { Product } from '../types/snap';

type Props = {
  /** Called with the product, or null when the barcode is not in the database. */
  onResult: (barcode: string, product: Product | null) => void;
};

const SCAN_EVERY_MS = 300;

/** Live barcode scanner with a typed-digits fallback. Looks the product up before reporting back. */
export function BarcodeScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [digits, setDigits] = useState('');
  const [status, setStatus] = useState('Point the camera at a product barcode, or enter its digits.');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const resultRef = useRef(onResult);
  resultRef.current = onResult;

  const lookUp = async (code: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setDigits(code);
    setStatus('Looking up that product…');
    try {
      resultRef.current(code, await lookupProduct(code));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not look that product up.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | undefined;
    let timer: number | undefined;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        const video = videoRef.current;
        if (cancelled || !video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        const detector = await getBarcodeDetector();

        const scan = async () => {
          if (cancelled) return;
          try {
            if (!busyRef.current && video.videoWidth) {
              const found = (await detector.detect(video)).find((code) => isValidBarcode(code.rawValue));
              if (found && !cancelled) await lookUp(found.rawValue);
            }
          } catch {
            // A frame that cannot be read is normal: keep scanning.
          }
          if (!cancelled) timer = window.setTimeout(() => void scan(), SCAN_EVERY_MS);
        };
        void scan();
      } catch {
        if (!cancelled) setStatus('Camera scanning is unavailable. Enter the digits under the barcode.');
      }
    };
    void start();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isValidBarcode(digits)) void lookUp(digits);
    else setStatus('Check the digits, including the final check digit.');
  };

  return (
    <form className="barcode-scanner" onSubmit={submit}>
      <div className="barcode-frame">
        <video ref={videoRef} playsInline muted className="barcode-video" />
        <span className="barcode-line" />
      </div>
      <p role="status" className="notice">
        {status}
      </p>
      <label className="formlabel">
        Product barcode
        <input
          className="field"
          inputMode="numeric"
          placeholder="e.g. 0123456789012"
          maxLength={14}
          value={digits}
          onChange={(event) => setDigits(event.target.value.replace(/\D/g, ''))}
        />
      </label>
      <button className="btn" disabled={!digits || busy}>
        {busy ? 'Looking up…' : 'Look up product'}
      </button>
    </form>
  );
}
