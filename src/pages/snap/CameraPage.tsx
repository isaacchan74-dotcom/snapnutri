import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { canvasToLowDetailDataUrl, fileToLowDetailDataUrl } from '../../lib/image';
import { formatDay, todayKey } from '../../lib/journal';
import { photoCoords } from '../../lib/photoLocation';
import { useUiStore } from '../../store/uiStore';
import { emptyDraft, type Coords, type Product, type SnapDraft, type SnapState } from '../../types/snap';
import { BarcodeScanner } from '../../ui/BarcodeScanner';
import { Icon } from '../../ui/Icon';
import { useManualMeal } from '../../ui/ManualMeal';

export type { SnapState };

type Facing = 'environment' | 'user';
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };

export function CameraPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SnapState | null) ?? {};
  const day = state.day ?? todayKey();
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const showToast = useUiStore((s) => s.showToast);
  const manualMeal = useManualMeal();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [facing, setFacing] = useState<Facing>('environment');
  const [canFlip, setCanFlip] = useState(false);
  /** null = this camera has no flash. */
  const [torch, setTorch] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  const toDetails = (patch: Partial<SnapDraft>) => {
    const draft: SnapDraft = { ...emptyDraft(), ...state.draft, ...patch };
    navigate('/snap/details', { replace: true, state: { day, type: state.type, draft } });
  };

  /** A new photo replaces the old one and whatever location came with it. */
  const withPhoto = (image: string, coords?: Coords) => toDetails({ image, photoCoords: coords });

  useEffect(() => {
    let cancelled = false;
    setLive(false);
    setTorch(null);
    // The barcode scanner opens its own camera stream.
    if (scanning) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setBlocked(true);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setLive(true);
        setBlocked(false);
        const capabilities = stream.getVideoTracks()[0]?.getCapabilities?.() as TorchCapabilities | undefined;
        if (capabilities?.torch) setTorch(false);
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            if (!cancelled) setCanFlip(devices.filter((device) => device.kind === 'videoinput').length > 1);
          })
          .catch(() => undefined);
      })
      .catch(() => setBlocked(true));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing, scanning]);

  useEffect(() => {
    if (!state.retake) return;
    openModal(
      'We couldn’t identify everything.',
      <>
        <p className="muted">{state.retake} That’s okay — try another photo or add foods yourself.</p>
        <button className="btn" onClick={closeModal}>
          Retake photo
        </button>
        <button
          className="btn secondary"
          onClick={() => {
            closeModal();
            uploadRef.current?.click();
          }}
        >
          Choose from library
        </button>
        <button className="btn quiet" onClick={() => manualMeal(day, state.type)}>
          Add manually
        </button>
      </>,
    );
    // Clear the flag so a refresh does not reopen the sheet.
    navigate('/snap', { replace: true, state: { day, type: state.type, draft: state.draft } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.retake]);

  const shutter = () => {
    if (live && videoRef.current?.videoWidth) {
      try {
        withPhoto(canvasToLowDetailDataUrl(videoRef.current));
      } catch {
        showToast('Could not capture that frame. Try again.');
      }
      return;
    }
    captureRef.current?.click();
  };

  const onFile = async (file: File | undefined, fromLibrary: boolean) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image.');
      return;
    }
    try {
      // Read the location first: resizing the photo drops it.
      const [coords, image] = await Promise.all([
        fromLibrary ? photoCoords(file) : Promise.resolve(undefined),
        fileToLowDetailDataUrl(file),
      ]);
      withPhoto(image, coords);
    } catch {
      showToast('Could not read that photo.');
    }
  };

  const toggleTorch = async () => {
    try {
      await streamRef.current
        ?.getVideoTracks()[0]
        .applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      showToast('Flash unavailable.');
    }
  };

  const onBarcode = (barcode: string, product: Product | null) => {
    if (product) {
      toDetails({ product });
      return;
    }
    setScanning(false);
    openModal(
      'We don’t know that product yet.',
      <>
        <p className="muted">
          Barcode {barcode} isn’t in the product database. Snap the food or its nutrition label instead, or add it yourself.
        </p>
        <button className="btn" onClick={closeModal}>
          Take a photo
        </button>
        <button className="btn quiet" onClick={() => manualMeal(day, state.type)}>
          Enter manually
        </button>
      </>,
    );
  };

  const close = () => {
    if (state.draft?.image || state.draft?.product) {
      navigate('/snap/details', { replace: true, state });
      return;
    }
    navigate(day === todayKey() ? '/home' : `/journal/${day}`);
  };

  const logging = state.type || day !== todayKey();

  return (
    <>
      <header className="snap-head">
        <button className="iconbtn" aria-label="Close" onClick={close}>
          ×
        </button>
        <h1>Log a Meal</h1>
        {torch !== null && !scanning ? (
          <button className="iconbtn" aria-label="Toggle flash" aria-pressed={torch} onClick={() => void toggleTorch()}>
            ϟ
          </button>
        ) : null}
      </header>

      {scanning ? (
        <BarcodeScanner onResult={onBarcode} />
      ) : (
        <div className="camera-preview snap-preview">
          <span className="snap-hint">Snap your food or its packaging</span>
          <video ref={videoRef} autoPlay playsInline muted style={{ display: live ? 'block' : 'none' }} />
          {!live ? (
            <div className="camera-empty">
              <div>
                <Icon name="Snap" />
                <p>{blocked ? 'Camera is off. Tap the shutter to take a photo, or choose one from your library.' : 'Opening the camera…'}</p>
              </div>
            </div>
          ) : null}
          <div className="viewfinder" />
          {logging ? (
            <span className="chip snap-day">
              {state.type ? `${state.type} · ` : ''}
              {formatDay(day)}
            </span>
          ) : null}
        </div>
      )}

      <div className="segmented snap-modes">
        <button className={scanning ? '' : 'chosen'} aria-pressed={!scanning} onClick={() => setScanning(false)}>
          Photo
        </button>
        <button className={scanning ? 'chosen' : ''} aria-pressed={scanning} onClick={() => setScanning(true)}>
          Scan Barcode
        </button>
      </div>

      {!scanning ? (
        <div className="camera-controls">
          <button className="iconbtn" aria-label="Photo library" onClick={() => uploadRef.current?.click()}>
            <Icon name="Journal" />
          </button>
          <button className="shutter" aria-label="Take photo" onClick={shutter} />
          {canFlip ? (
            <button
              className="iconbtn"
              aria-label="Switch camera"
              onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
            >
              ↻
            </button>
          ) : (
            <span className="camera-spacer" />
          )}
        </div>
      ) : null}

      <button className="btn secondary" onClick={() => manualMeal(day, state.type)}>
        ✎　Enter Manually
      </button>

      <input ref={uploadRef} className="fileinput" type="file" accept="image/*" onChange={(event) => { void onFile(event.target.files?.[0], true); event.target.value = ''; }} />
      <input ref={captureRef} className="fileinput" type="file" accept="image/*" capture="environment" onChange={(event) => { void onFile(event.target.files?.[0], false); event.target.value = ''; }} />
    </>
  );
}
