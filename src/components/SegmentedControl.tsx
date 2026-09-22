export type Segment<T extends string> = {
  value: T;
  label: string;
  emoji?: string;
};

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented" role="tablist">
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={[
              'segmented__item',
              size === 'sm' ? 'segmented__item--sm' : '',
              selected ? 'segmented__item--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(segment.value)}
          >
            {segment.emoji ? <span>{segment.emoji}</span> : null}
            <span className={size === 'sm' ? 'text text--caption' : 'text text--body-strong'}>
              {segment.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
