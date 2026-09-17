/** Conversions between the metric values we store and the imperial values US students type. */

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const LB_PER_KG = 2.20462;

export type HeightUnit = 'cm' | 'ftin';
export type WeightUnit = 'kg' | 'lb';

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return {
    feet: Math.floor(totalInches / INCHES_PER_FOOT),
    inches: totalInches % INCHES_PER_FOOT,
  };
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function formatHeight(cm: number): string {
  const { feet, inches } = cmToFeetInches(cm);
  return `${Math.round(cm)} cm (${feet}′ ${inches}″)`;
}

export function formatWeight(kg: number): string {
  return `${Math.round(kg)} kg (${Math.round(kgToLb(kg))} lb)`;
}
