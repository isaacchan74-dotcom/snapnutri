import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { analyzeMealPhoto } from '../../api/analyzeMeal';
import { AppText, Banner, Button, ScreenContainer } from '../../components';
import { canvasToLowDetailDataUrl, fileToLowDetailDataUrl } from '../../lib/image';

export function CameraScreen() {
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [live, setLive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retakeReason, setRetakeReason] = useState<string | null>(null);

  useEffect(() => {
    return () => stopLive();
  }, []);

  const stopLive = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLive(false);
  };

  const startLive = async () => {
    setError(null);
    setRetakeReason(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      cameraInputRef.current?.click();
    }
  };

  const captureLive = () => {
    if (!videoRef.current) return;
    try {
      setPreview(canvasToLowDetailDataUrl(videoRef.current));
      setRetakeReason(null);
      stopLive();
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : 'Could not capture that frame.');
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setRetakeReason(null);
    try {
      setPreview(await fileToLowDetailDataUrl(file));
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : 'Could not read that photo.');
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setError(null);
    setRetakeReason(null);
    try {
      const result = await analyzeMealPhoto(preview);
      if (result.needs_retake) {
        setRetakeReason(result.reason);
        return;
      }
      navigate('/journal/new', { state: { estimate: result, photo: preview } });
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : 'Could not analyze that photo.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScreenContainer
      title="Snap a meal"
      subtitle="Photo first. You still get to approve the numbers."
    >
      <input
        ref={cameraInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <input
        ref={uploadInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      <div className="stack">
        {error ? <Banner message={error} /> : null}
        {retakeReason ? <Banner tone="info" message={retakeReason} /> : null}

        {live ? (
          <video ref={videoRef} className="snap-frame" autoPlay playsInline muted />
        ) : preview ? (
          <img className="snap-frame" src={preview} alt="Meal preview" />
        ) : (
          <div className="snap-frame snap-frame--empty">
            <AppText variant="heading" align="center">
              📸
            </AppText>
            <AppText variant="caption" color="secondary" align="center">
              Take a photo or upload one. Blurry plates get a redo, not a fake log.
            </AppText>
          </div>
        )}

        {live ? (
          <div className="stack stack--md">
            <Button label="Capture" onClick={captureLive} />
            <Button label="Cancel camera" variant="ghost" onClick={stopLive} />
          </div>
        ) : preview ? (
          <div className="stack stack--md">
            <Button label="Add to Journal" onClick={() => void handleAnalyze()} loading={analyzing} />
            <Button
              label="Choose another photo"
              variant="ghost"
              onClick={() => {
                setPreview(null);
                setRetakeReason(null);
              }}
              disabled={analyzing}
            />
          </div>
        ) : (
          <div className="stack stack--md">
            <Button label="Open camera" onClick={() => void startLive()} />
            <Button label="Upload a photo" variant="secondary" onClick={() => uploadInputRef.current?.click()} />
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
