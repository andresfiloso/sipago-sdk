/** ISO 4217 numeric currency codes supported by SiPago. */
export const Currency = {
  /** Argentine Peso */
  ARS: '032',
} as const;

export type CurrencyCode = (typeof Currency)[keyof typeof Currency];

export interface Price {
  currency: CurrencyCode;
  /** Amount in minor units (last two digits are cents). E.g. 20069 = 200.69 */
  amount: number;
}

export interface JsonApiResource<TAttributes, TType extends string = string> {
  id?: string;
  type?: TType;
  attributes: TAttributes;
  links?: unknown;
}

export interface JsonApiEnvelope<TAttributes, TType extends string = string> {
  data: JsonApiResource<TAttributes, TType>;
}

export interface JsonApiListEnvelope<TAttributes, TType extends string = string> {
  data: JsonApiResource<TAttributes, TType>[];
}
