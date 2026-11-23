import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { fetchNearbyPlaces, recentPlaces, rememberPlace, type NearbyPlace } from '../../api/places';
import { productBasisLabel } from '../../api/products';
import { fileToLowDetailDataUrl } from '../../lib/image';
import { deviceCoords } from '../../lib/photoLocation';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { NOTES_MAX, PLACE_MAX, type PlaceType, type Product, type SnapDraft, type SnapState } from '../../types/snap';
import { BarcodeScanner } from '../../ui/BarcodeScanner';
import { Icon } from '../../ui/Icon';

type Panel = 'nearby' | 'search' | null;

/** A place this close to the photo's GPS point is offered as the suggestion. */
const SUGGEST_WITHIN_M = 75;

export function DetailsPage() {
  const navigate = useNavigate();
  const state = (useLocation().state as SnapState | null) ?? {};
  const userId = useAuthStore((s) => s.user?.id);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const showToast = useUiStore((s) => s.showToast);

  const [draft, setDraft] = useState<SnapDraft | undefined>(state.draft);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [nearby, setNearby] = useState<NearbyPlace[] | null>(null);
  const [nearbyNote, setNearbyNote] = useState('');
  const [servingsText, setServingsText] = useState(String(state.draft?.servings ?? 1));

  const photoPoint = draft?.photoCoords;

  // An uploaded photo that still carries GPS: look around that point straight away.
  useEffect(() => {
    if (!photoPoint) return;
    let current = true;
    fetchNearbyPlaces(photoPoint)
      .then((places) => {
        if (current) setNearby(places);
      })
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [photoPoint]);

  if (!draft || (!draft.image && !draft.product)) return <Navigate to="/snap" replace state={state} />;

  const patch = (change: Partial<SnapDraft>) => setDraft((current) => (current ? { ...current, ...change } : current));
  const servings = Number(servingsText.replace(',', '.'));
  const servingsOk = Number.isFinite(servings) && servings > 0 && servings <= 20;
  const suggested = !draft.place && photoPoint && nearby?.[0] && nearby[0].distance <= SUGGEST_WITHIN_M ? nearby[0].name : null;
  const labelled = !!draft.label || !!draft.product;

  const retake = () => navigate('/snap', { replace: true, state: { ...state, draft } });

  const choosePlace = (name: string, type: PlaceType) => {
    patch({ place: { name: name.trim().slice(0, PLACE_MAX), type } });
    setOpen(false);
    setPanel(null);
    setQuery('');
  };

  const findNearby = async () => {
    setPanel('nearby');
    setNearbyNote('Looking around…');
    try {
      const places = await fetchNearbyPlaces(photoPoint ?? (await deviceCoords()));
      setNearby(places);
      setNearbyNote(places.length ? '' : 'No restaurants found close by. Use Search to enter a place.');
    } catch (error) {
      setNearbyNote(error instanceof Error ? error.message : 'Nearby places are not available right now.');
    }
  };

  const onLabel = async (file: File | undefined) => {
    if (!file) return;
    try {
      patch({ label: await fileToLowDetailDataUrl(file) });
      closeModal();
    } catch {
      showToast('Could not read that label. Choose another image.');
    }
  };

  const pickLabel = () =>
    openModal(
      'Upload Nutrition Facts',
      <>
        {['Take a photo', 'Photo Library'].map((text, index) => (
          <label key={text} className="btn secondary label-picker">
            {text}
            <input type="file" accept="image/*" capture={index === 0 ? 'environment' : undefined} onChange={(event) => void onLabel(event.target.files?.[0])} />
          </label>
        ))}
      </>,
    );

  const onBarcode = (barcode: string, product: Product | null) => {
    closeModal();
    if (product) patch({ product });
    else showToast(`Barcode ${barcode} isn’t in the product database yet.`);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) choosePlace(query, 'other');
  };

  const analyze = () => {
    rememberPlace(userId, draft.place);
    navigate('/snap/analyzing', { replace: true, state: { ...state, draft: { ...draft, servings } } });
  };

  const product = draft.product;
  const recents = recentPlaces(userId).filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="snap-details">
      <header className="snap-head">
        <button className="iconbtn" aria-label="Back to camera" onClick={retake}>
          ‹
        </button>
        <h1>Add Details</h1>
      </header>

      {draft.image ? (
        <div className="detail-photo">
          <img src={draft.image} alt="Your meal" />
          <button onClick={retake}>↻　Retake</button>
        </div>
      ) : null}

      {product ? (
        <div className="product-card">
          <div>
            <strong>{product.name}</strong>
            <small>
              {product.brand ? `${product.brand} · ` : ''}
              {product.calories} kcal · P {product.protein} · C {product.carbs} · F {product.fat} {productBasisLabel(product)}
            </small>
          </div>
          <button className="link" onClick={() => (draft.image ? patch({ product: undefined }) : retake())}>
            {draft.image ? 'Remove' : 'Rescan'}
          </button>
        </div>
      ) : null}

      <h3>Where did you eat?</h3>
      <button className="location-row" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{draft.place?.name || suggested || 'Choose a location'}</span>
        {suggested ? <small>Suggested · from photo location</small> : null}
        <span aria-hidden="true">{open ? '⌃' : '⌄'}</span>
      </button>
      {open ? (
        <div className="place-options">
          <div className="place-buttons">
            <button onClick={() => void findNearby()}>⌖ Nearby</button>
            <button onClick={() => choosePlace('At Home', 'home')}>⌂ At Home</button>
            <button onClick={() => setPanel('search')}>⚲ Search</button>
          </div>
          {suggested ? (
            <button className="link" onClick={() => choosePlace(suggested, 'restaurant')}>
              Use suggested location
            </button>
          ) : null}
          {draft.place ? (
            <button className="link" onClick={() => patch({ place: undefined })}>
              Clear location
            </button>
          ) : null}
          {panel === 'nearby' ? (
            <>
              {nearbyNote ? <p className="notice">{nearbyNote}</p> : null}
              {!nearbyNote
                ? nearby?.map((place) => (
                    <button key={place.name} className="location-row" onClick={() => choosePlace(place.name, 'restaurant')}>
                      <span>{place.name}</span>
                      <small>{place.distance < 15 ? 'Here' : `${Math.round(place.distance / 5) * 5} m`}</small>
                    </button>
                  ))
                : null}
            </>
          ) : null}
          {panel === 'search' ? (
            <form onSubmit={submitSearch}>
              <input
                className="field"
                aria-label="Restaurant or place"
                maxLength={PLACE_MAX}
                placeholder="Restaurant or place"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button className="link" disabled={!query.trim()}>
                Use this location
              </button>
              {recents.map((place) => (
                <button key={place.name} type="button" className="location-row" onClick={() => choosePlace(place.name, place.type)}>
                  {place.name}
                </button>
              ))}
            </form>
          ) : null}
        </div>
      ) : null}

      {draft.image ? (
        <>
          <h3>
            Add More Information <small>Optional</small>
          </h3>
          <div className="attachment-grid">
            <div>
              <button onClick={() => openModal('Scan Barcode', <BarcodeScanner onResult={onBarcode} />)}>
                <Icon name="Barcode" />
                <strong>Scan Barcode</strong>
                <small>{product ? 'Product attached · Replace' : 'For packaged or ready-to-eat food'}</small>
              </button>
            </div>
            <div>
              <button onClick={pickLabel}>
                <Icon name="NutritionLabel" />
                <strong>Upload Nutrition Facts</strong>
                <small>{draft.label ? 'Label attached · Replace' : 'Photo of the nutrition label'}</small>
              </button>
              {draft.label ? (
                <button className="link" onClick={() => patch({ label: undefined })}>
                  Remove label
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div className="portion-row">
        <label htmlFor="meal-portion">Portion</label>
        <div>
          <input
            id="meal-portion"
            className="field serving-input"
            type="text"
            inputMode="decimal"
            value={servingsText}
            aria-invalid={!servingsOk}
            aria-describedby="serving-hint"
            onChange={(event) => setServingsText(event.target.value)}
          />{' '}
          <span>{servings === 1 ? 'serving' : 'servings'}</span>
        </div>
      </div>
      <p className="notice" id="serving-hint">
        {!servingsOk
          ? 'Enter a serving amount between 0 and 20.'
          : labelled
            ? product?.basis === '100g' && !draft.label
              ? '1 serving = 100 g of this product.'
              : '1 serving = one serving as listed on the label.'
            : '1 serving = everything in the photo. Had half? Enter 0.5.'}
      </p>

      {draft.image ? (
        <>
          <label className="formlabel formblock">
            Additional Notes
            <textarea
              className="field"
              aria-describedby="notes-hint"
              maxLength={NOTES_MAX}
              placeholder="e.g., no sauce, extra rice, cooked in olive oil…"
              value={draft.notes}
              onChange={(event) => patch({ notes: event.target.value })}
            />
          </label>
          <p className="notice" id="notes-hint">
            Details about ingredients and preparation help us estimate your nutrition more accurately.
          </p>
        </>
      ) : null}

      <div className="analyze-footer">
        <button className="btn" disabled={!servingsOk} onClick={analyze}>
          {draft.image ? 'Analyze Meal' : 'Add to Journal'}
        </button>
      </div>
    </div>
  );
}
