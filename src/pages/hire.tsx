import React from 'react'
import { Button, Form } from 'react-bootstrap'
import Calendar from '../components/Calendar'
import PostcodeField from '../components/PostcodeField'
import useAsyncValidatedInput from '../hooks/useAsyncValidatedInput'
import { validatePostcode } from '../utils/validators'

const Hire = () => {
	const postcode = useAsyncValidatedInput<string>(validatePostcode)
	return (
		<Form>
			<Calendar isStudent={false} />
			<PostcodeField
				loading={postcode.loading}
				isInvalid={postcode.valid == false}
				isValid={postcode.valid}
				onChange={postcode.setValue}
				invalidMessage={postcode.message}
				onValidate={postcode.validate}
			/>
			<Button type='submit'>Submit</Button>
		</Form>
	)
}

// TODO on submit display all hot tubs that match criteria
//TODO when selected go straight to checkout
export default Hire
