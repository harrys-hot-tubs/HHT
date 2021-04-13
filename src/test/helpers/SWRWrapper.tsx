import React, { ReactNode } from 'react'
import { SWRConfig } from 'swr'

// https://github.com/SoYoung210/soso-tip/issues/52
const SWRWrapper = ({ children }: { children: ReactNode[] }) => (
	<SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
)

export default SWRWrapper
