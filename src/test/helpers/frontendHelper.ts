import HeadProvider from '@helpers/HeadProvider'
import { render as baseRender } from '@testing-library/react'

export const headedRender = (
	jsx: React.ReactElement
): ReturnType<typeof baseRender> => {
	return baseRender(jsx, { wrapper: HeadProvider })
}
