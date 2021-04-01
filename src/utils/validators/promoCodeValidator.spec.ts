import validPromoCodes from '@json/validPromoCodes.json'
import validatePromoCode, {
	PromoCodeError,
} from '@utils/validators/promoCodeValidator'

it('accepts valid promo codes', () => {
	expect(validatePromoCode(validPromoCodes[0])).toEqual<
		[boolean, PromoCodeError]
	>([true, null])
})

it('rejects invalid promo codes', () => {
	expect(validatePromoCode('TEST')).toEqual<[boolean, PromoCodeError]>([
		false,
		'invalid',
	])
})

it('rejects falsy promo codes', () => {
	expect(validatePromoCode(undefined)).toEqual<[boolean, PromoCodeError]>([
		false,
		'invalid',
	])
	expect(validatePromoCode(null)).toEqual<[boolean, PromoCodeError]>([
		false,
		'invalid',
	])
	expect(validatePromoCode('')).toEqual<[boolean, PromoCodeError]>([
		false,
		'invalid',
	])
})
