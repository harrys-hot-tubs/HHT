/**
 * Executes an asynchronous callback function for each element in an array.
 * @param array An array of objects.
 * @param callback An async function to be executed on each element of the array.
 */
export const forEachAsync = async <T>(
	array: T[],
	callback: (element: T) => Promise<void>
): Promise<void> => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index])
	}
}
