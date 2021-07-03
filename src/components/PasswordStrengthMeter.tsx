import { CSSProperties, useEffect } from 'react'
import zxcvbn from 'zxcvbn'

interface ComponentProps {
	password: string
	onChange: (acceptable: boolean) => void
}

const strengths = ['Terrible', 'Very Weak', 'Weak', 'Good', 'Strong']

const PasswordStrengthChecker = ({ password, onChange }: ComponentProps) => {
	const res = checkStrength(password)

	useEffect(() => {
		onChange(res.score >= 3)
	}, [res.score])

	return (
		<div className='password-strength-checker'>
			<span data-testid='password-strength'>
				<strong>Password Strength:</strong> {strengths[res.score]}
			</span>
			<span className='strength-meter'>
				<span
					className='strength-meter-fill'
					style={{
						...computeStyle(res),
					}}
				/>
			</span>
			{res.feedback.warning !== '' ? (
				<span className='strength-warning'>{res.feedback.warning}</span>
			) : null}

			{res.feedback.suggestions.length > 0 && password ? (
				<>
					<hr />
					<strong>Recommendations</strong>
					<ul className='recommendations' data-testid='recommendations'>
						{res.feedback.suggestions.map((suggestion, idx) => (
							<li key={idx}>{suggestion}</li>
						))}
					</ul>
				</>
			) : null}
		</div>
	)
}

function computeStyle({ score }: zxcvbn.ZXCVBNResult): CSSProperties {
	switch (score) {
		case 1:
			return { background: '#d2222d', width: '25%' }
		case 2:
			return { background: '#FFC100', width: '50%' }
		case 3:
			return { background: '#238823', width: '75%' }
		case 4:
			return { background: '#f8a0ec', width: '100%' }
		default:
			return { background: '#000', width: '0%' }
	}
}

/**
 * Determines the strength of a given password.
 *
 * @param password The password to have its strength checked.
 */
const checkStrength = (password: string): zxcvbn.ZXCVBNResult => {
	return zxcvbn(password)
}

export default PasswordStrengthChecker
