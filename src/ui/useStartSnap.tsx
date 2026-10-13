import { useNavigate } from 'react-router-dom';

import { useMealStore } from '../store/mealStore';
import { useUiStore } from '../store/uiStore';
import type { MealType } from '../types/meal';

export type SnapIntent = { day: string; type?: MealType };

/** Opens the camera, first offering any unreviewed draft — like the prototype's startSnap. */
export function useStartSnap() {
  const navigate = useNavigate();
  const meals = useMealStore((state) => state.meals);
  const openModal = useUiStore((state) => state.openModal);
  const closeModal = useUiStore((state) => state.closeModal);

  return (intent: SnapIntent) => {
    const draft = meals.find((meal) => !meal.reviewed);
    const fresh = () => {
      closeModal();
      navigate('/snap', { state: intent });
    };
    if (!draft) {
      fresh();
      return;
    }
    openModal(
      'Pick up where you left off?',
      <>
        <p className="muted">You have a meal waiting to be reviewed.</p>
        <button
          className="btn"
          onClick={() => {
            closeModal();
            navigate(`/meal/${draft.id}/review`);
          }}
        >
          Continue your meal
        </button>
        <button className="btn secondary" onClick={fresh}>
          Start a new meal
        </button>
      </>,
    );
  };
}
