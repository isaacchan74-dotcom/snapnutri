import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { canvasToLowDetailDataUrl, fileToLowDetailDataUrl } from '../../lib/image';
import { formatDay, todayKey } from '../../lib/journal';
import { useUiStore } from '../../store/uiStore';
import type { MealType } from '../../types/meal';
import { BackHead } from '../../ui/BackHead';
import { Icon } from '../../ui/Icon';
import { useManualMeal } from '../../ui/ManualMeal';

export type SnapState = { day?: string; type?: MealType; retake?: string };

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

  const analyze = (photo: string) => navigate('/snap/analyzing', { state: { photo, day, type: state.type } });

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setBlocked(true);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setLive(true);
      })
      .catch(() => setBlocked(true));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

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
    navigate('/snap', { replace: true, state: { day, type: state.type } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.retake]);

  const shutter = () => {
    if (live && videoRef.current?.videoWidth) {
      try {
        analyze(canvasToLowDetailDataUrl(videoRef.current));
      } catch {
        showToast('Could not capture that frame. Try again.');
      }
      return;
    }
    captureRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image.');
      return;
    }
    try {
      analyze(await fileToLowDetailDataUrl(file));
    } catch {
      showToast('Could not read that photo.');
    }
  };

  return (
    <>
      <BackHead title="Snap your meal" to={day === todayKey() ? '/home' : `/journal/${day}`} />
      <p className="muted">We’ll estimate what’s on your plate.</p>
      <div className="camera-preview">
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
        <span className="chip" style={{ position: 'absolute', bottom: 15, left: 15, background: '#fffdf8df', color: '#65564a' }}>
          {state.type ? `${state.type} · ` : ''}
          {formatDay(day)}
        </span>
      </div>
      <div className="camera-controls">
        <button className="iconbtn" aria-label="Upload your own photo" onClick={() => uploadRef.current?.click()}>
          <Icon name="Journal" />
        </button>
        <button className="shutter" aria-label="Take photo" onClick={shutter} />
        <button className="iconbtn" aria-label="Manual entry" onClick={() => manualMeal(day, state.type)}>
          +
        </button>
      </div>
      <p className="notice center">
        Tap the shutter to snap your plate,
        <br />
        or upload a photo from your library.
      </p>
      <input ref={uploadRef} className="fileinput" type="file" accept="image/*" onChange={(event) => { void onFile(event.target.files?.[0]); event.target.value = ''; }} />
      <input ref={captureRef} className="fileinput" type="file" accept="image/*" capture="environment" onChange={(event) => { void onFile(event.target.files?.[0]); event.target.value = ''; }} />
    </>
  );
}
