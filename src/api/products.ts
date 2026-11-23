import type { Product } from '../types/snap';

const FIELDS = 'product_name,generic_name,brands,serving_size,nutriments';

const round1 = (value: number) => Math.round(value * 10) / 10;

function amount(nutriments: Record<string, unknown>, key: string, basis: 'serving' | '100g'): number | null {
  const value = Number(nutriments[`${key}_${basis}`]);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Looks a barcode up in Open Food Facts (free, no key).
 * Returns null when the product is unknown or has no calorie data.
 */
export async function lookupProduct(barcode: string): Promise<Product | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`,
    { signal: AbortSignal.timeout(10_000) },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The product database is not answering. Try again in a moment.');

  const data = (await response.json()) as { status?: number; product?: Record<string, unknown> };
  const product = data.product;
  if (data.status !== 1 || !product) return null;

  const nutriments = (product.nutriments ?? {}) as Record<string, unknown>;
  const basis = amount(nutriments, 'energy-kcal', 'serving') != null ? 'serving' : '100g';
  const calories = amount(nutriments, 'energy-kcal', basis);
  const name = [product.product_name, product.generic_name].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );
  if (calories == null || !name) return null;

  const brand = typeof product.brands === 'string' ? product.brands.split(',')[0].trim() : '';
  const serving = typeof product.serving_size === 'string' ? product.serving_size.trim() : '';

  return {
    barcode,
    name: name.trim().slice(0, 80),
    brand: brand ? brand.slice(0, 60) : null,
    servingSize: basis === 'serving' && serving ? serving.slice(0, 60) : null,
    basis,
    calories: Math.round(calories),
    protein: round1(amount(nutriments, 'proteins', basis) ?? 0),
    carbs: round1(amount(nutriments, 'carbohydrates', basis) ?? 0),
    fat: round1(amount(nutriments, 'fat', basis) ?? 0),
  };
}

export function productBasisLabel(product: Product): string {
  return product.basis === 'serving' ? `per serving${product.servingSize ? ` (${product.servingSize})` : ''}` : 'per 100 g';
}
