import { AppText } from './AppText';

type InfoRowProps = {
  label: string;
  value: string;
  last?: boolean;
};

export function InfoRow({ label, value, last = false }: InfoRowProps) {
  return (
    <div className={last ? 'info-row info-row--last' : 'info-row'}>
      <AppText as="span" variant="body" color="secondary">
        {label}
      </AppText>
      <AppText as="span" variant="bodyStrong">
        {value}
      </AppText>
    </div>
  );
}
