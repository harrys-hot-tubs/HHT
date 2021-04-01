import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

const priceFormat = new Intl.NumberFormat(['en-GB'], {
	style: 'currency',
	currency: 'GBP',
	currencyDisplay: 'symbol',
})

/**
 * Returns a new Stripe instance if one doesn't already exist. If one already exists, it is returned.
 * @returns A promise for the stripe object.
 */
export const getStripe = (): Promise<Stripe> => {
	if (!stripePromise) {
		stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_TOKEN)
	}
	return stripePromise
}

/**
 * Takes a human-readable price and formats it for stripe.
 * @param amount A human-readable price in pounds.
 * @returns A formatted price.
 * @throws If the price is less than 0.
 */
export const formatAmount = (amount: number): number => {
	if (amount < 0) throw new RangeError('Amount cannot be negative')

	const parts = priceFormat.formatToParts(amount)
	const zeroDecimalCurrency: boolean = !parts.some(
		(part) => part.type == 'decimal'
	)
	return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}

/**
 * Formats a price for display.
 * @param price A price from stripe - in pennies.
 * @returns The price in pounds and pence.
 * @throws If the price is less than 0.
 */
export const priceToString = (price: number): string => {
	if (price < 0) throw new RangeError('Price cannot be negative')
	return priceFormat.format(price / 100)
}
