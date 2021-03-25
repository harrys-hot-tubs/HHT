export const setStorage = (obj: { [key: string]: string }) => {
	Object.keys(obj).forEach((key) => {
		cy.setLocalStorage(key, obj[key])
	})
}
