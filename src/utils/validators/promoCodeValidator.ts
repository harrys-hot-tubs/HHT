import validPromoCodes from '@json/validPromoCodes.json'

export type PromoCodeError = 'invalid' | 'dead'

const validatePromoCode = (promoCode: string): [boolean, PromoCodeError] => {
	if (validPromoCodes.includes(promoCode)) return [true, null]
	else return [false, 'invalid']
}

export default validatePromoCode
