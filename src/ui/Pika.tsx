export const PIKA_HAPPY = '/pika/happy.jpg';
export const PIKA_RESTING = '/pika/resting.jpg';

export function Pika({ happy = false, className = 'pika' }: { happy?: boolean; className?: string }) {
  return (
    <img
      className={className}
      src={happy ? PIKA_HAPPY : PIKA_RESTING}
      alt={happy ? 'Pika, your fluffy gray and cream companion' : 'Pika resting while waiting for your next meal'}
    />
  );
}

export function AccessoryOverlay({ accessory }: { accessory: string | null }) {
  if (!accessory || (accessory !== 'Tiny scarf' && accessory !== 'Leaf hat')) return null;
  return <div className={`accessory-overlay ${accessory === 'Leaf hat' ? 'leaf' : ''}`} />;
}
