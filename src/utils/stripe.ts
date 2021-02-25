import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
	if (!stripePromise) {
		stripePromise = loadStripe(process.env.NEXT_PUBLIC_TEST_STRIPE_TOKEN)
	}
	return stripePromise
}

export const formatAmount = (amount: number) => {
	let numberFormat = new Intl.NumberFormat(['en-GB'], {
		style: 'currency',
		currency: process.env.STRIPE_CURRENCY,
		currencyDisplay: 'symbol',
	})
	const parts = numberFormat.formatToParts(amount)
	let zeroDecimalCurrency: boolean = true
	for (let part of parts) {
		if (part.type === 'decimal') {
			zeroDecimalCurrency = false
		}
	}
	return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}
