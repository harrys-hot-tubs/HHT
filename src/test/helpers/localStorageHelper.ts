export const setStorage = (obj: { [key: string]: string }) => {
	Object.keys(obj).forEach((key) => {
		localStorage.setItem(key, obj[key])
	})
}
