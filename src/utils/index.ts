export const forEachAsync = async <T>(
	array: T[],
	callback: (element: T) => Promise<void>
): Promise<void> => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index])
	}
}
