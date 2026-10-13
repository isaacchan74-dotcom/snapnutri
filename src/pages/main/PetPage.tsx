import { useNavigate } from 'react-router-dom';

import { ACCESSORIES, levelOf, usePetStore } from '../../store/petStore';
import { useUiStore } from '../../store/uiStore';
import { BackHead } from '../../ui/BackHead';
import { useJournalData } from '../../ui/hooks';
import { AccessoryOverlay, Pika } from '../../ui/Pika';
import { ScoreBlock } from '../../ui/ScoreBlock';

export function PetPage() {
  const navigate = useNavigate();
  useJournalData();
  const pet = usePetStore((state) => state.pet);
  const feed = usePetStore((state) => state.feed);
  const spendTime = usePetStore((state) => state.spendTime);
  const showToast = useUiStore((state) => state.showToast);
  const level = levelOf(pet?.xp ?? 0);

  return (
    <>
      <BackHead title="Pika" sub="Small explorer. Big heart." to="/home" />
      <div className="pet-portrait">
        <Pika happy />
        <AccessoryOverlay accessory={pet?.accessory ?? null} />
      </div>
      <section className="card">
        <ScoreBlock pet={pet} detail />
        <div style={{ marginTop: 25 }}>
          <div className="score-label">
            <span>Level {level.level}</span>
            <strong>
              {level.toNext} XP to Level {level.level + 1}
            </strong>
          </div>
          <div className="bar">
            <span style={{ width: `${level.share}%`, background: 'var(--clay)' }} />
          </div>
        </div>
      </section>
      <div className="formrow formblock">
        <button
          className="btn"
          onClick={async () => {
            if (await feed()) showToast('A little snack for Pika. Happiness +3 · 10 points used');
            else showToast('A meal log earns 10 points for Pika’s next snack.');
          }}
        >
          Feed Pika
        </button>
        <button className="btn secondary" onClick={() => navigate('/pet/accessories')}>
          Accessories
        </button>
      </div>
      <button
        className="link block"
        onClick={async () => {
          await spendTime();
          showToast('Pika loves your company. Happiness +2');
        }}
      >
        Spend a little time together
      </button>
      <p className="notice center">
        These are Pika’s pet attributes.
        <br />A little reflection of your shared habits. {pet ? `${pet.points} points saved.` : ''}
      </p>
    </>
  );
}

export function AccessoriesPage() {
  useJournalData();
  const pet = usePetStore((state) => state.pet);
  const equip = usePetStore((state) => state.equip);
  const showToast = useUiStore((state) => state.showToast);
  const level = levelOf(pet?.xp ?? 0).level;

  const wear = async (accessory: string | null) => {
    await equip(accessory);
    showToast(accessory ? `${accessory} looks lovely on Pika.` : 'Back to Pika’s fluffy self.');
  };

  return (
    <>
      <BackHead title="Pika’s little wardrobe" to="/pet" />
      <div className="pet-portrait">
        <Pika happy />
        <AccessoryOverlay accessory={pet?.accessory ?? null} />
      </div>
      <div className="row between" style={{ marginBottom: 15 }}>
        <span className="eyebrow">A few favorite things</span>
        <span className="small muted">{pet?.points ?? 0} points</span>
      </div>
      <div className="accessory-grid">
        {ACCESSORIES.map((item) => {
          const locked = level < item.level;
          const worn = pet?.accessory === item.name;
          return (
            <button key={item.name} className={`accessory-tile ${worn ? 'selected' : ''}`} disabled={locked} onClick={() => void wear(item.name)}>
              <div className="swatch">{item.glyph}</div>
              <strong>{item.name}</strong>
              <span className="small muted">{locked ? `Unlock at Level ${item.level}` : worn ? 'Equipped' : 'Owned · Tap to wear'}</span>
            </button>
          );
        })}
      </div>
      {pet?.accessory ? (
        <button className="link block" onClick={() => void wear(null)}>
          Remove accessory
        </button>
      ) : null}
    </>
  );
}
