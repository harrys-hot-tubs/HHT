import SpinnerButton from '@components/SpinnerButton'
import TooltipButton from '@components/TooltipButton'
import useAccountInformation from '@hooks/useAccountInformation'
import axios from 'axios'
import React, { useState } from 'react'
import { Alert, AlertProps, Popover } from 'react-bootstrap'
import DeleteAccountButton from '../DeleteAccountButton'

const CustomerDashboard = () => {
	const { account, isLoading, isError } = useAccountInformation()
	const [alertProps, setAlertProps] = useState<
		Pick<AlertProps, 'variant' | 'show'> & { heading: string; content: string }
	>({
		variant: undefined,
		show: false,
		heading: undefined,
		content: undefined,
	})
	const [GDPRSpinning, setGDPRSpinning] = useState(false)
	const [requestSent, setRequestSent] = useState(false)

	const onGDPRRequest: React.MouseEventHandler<HTMLElement> = async (event) => {
		event.preventDefault()
		setGDPRSpinning(true)
		try {
			await axios.post(`/api/accounts/${account.account_id}`, {
				type: 'GDPR',
			})
			setRequestSent(true)
			setAlertProps({
				variant: 'success',
				heading: 'Success!',
				content:
					'A request for all information that we keep about you has been successfully submitted. You can expect an email from us to your account email address soon.',
				show: true,
			})
		} catch (error) {
			setAlertProps({
				variant: 'danger',
				heading: 'Error',
				content: error.message,
				show: true,
			})
		} finally {
			setGDPRSpinning(false)
		}
	}

	if (isLoading) return <h1>Loading...</h1>
	// TODO add proper loading indicator
	if (isError) return <h1>Error</h1>
	// TODO add proper error indicator
	return (
		<div className='outer customer-dashboard'>
			<aside>
				<Alert
					{...alertProps}
					dismissible
					onClose={() => setAlertProps({ ...alertProps, show: false })}
					data-testid='dashboard-alert'
				>
					<Alert.Heading>{alertProps.heading}</Alert.Heading>
					<p>{alertProps.content}</p>
				</Alert>
			</aside>
			<main>
				<h1>Account</h1>
				<h2>
					{account.first_name} {account.last_name}
				</h2>
				<section>
					<h2>Account Update Form</h2>
					<DeleteAccountButton account={account} />
				</section>
				<section className='gdpr-button-container'>
					<TooltipButton
						placement='top-end'
						overlay={
							<Popover id='gdpr-tooltip'>
								<Popover.Content>
									An information request has been already been filed for this
									account.
								</Popover.Content>
							</Popover>
						}
						disabled={account.active_information_request || requestSent}
					>
						<SpinnerButton
							data-testid='gdpr-request-button'
							type='button'
							disabled={account.active_information_request || requestSent}
							status={GDPRSpinning}
							activeText='Submitting request...'
							onClick={onGDPRRequest}
						>
							Request a Copy of Your Data
						</SpinnerButton>
					</TooltipButton>
				</section>
			</main>
		</div>
	)
}

export default CustomerDashboard
