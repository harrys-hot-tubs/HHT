import HireForm from '@components/HireForm'
import Head from 'next/head'
import React from 'react'

/**
 * Landing page.
 */
const Home = () => {
	return (
		<div className='outer'>
			<Head>
				<title>Harry's Hot Tubs</title>
			</Head>
			<h1 className='title' role='heading' aria-level={1}>
				Harry's Hot Tubs
			</h1>
			<img src='lead3.jpeg' className='hero-image' />
			<div className='lean-to' id='lead'>
				<p className='introduction'>
					With 5 star reviews from over 2,500 successful hires, Harry’s Hot Tubs
					is the number one hot tub rental company in the UK. Serving just over
					20 cities, our dedicated team of young, friendly professionals strive
					to make your life as easy as possible from booking your hot tub all
					the way through to collection.
				</p>
				<span className='links'>
					<a
						href='/docs/Privacy Policy.pdf'
						target='_blank'
						aria-label='privacy policy'
					>
						GDPR Statement
					</a>
					,{' '}
					<a href='/docs/FAQs.pdf' target='_blank' aria-label='FAQs'>
						FAQ
					</a>{' '}
					and{' '}
					<a
						href='/docs/T&Cs.pdf'
						target='_blank'
						aria-label='terms and conditions'
					>
						T&amp;Cs
					</a>
				</span>
			</div>
			<section id='book'>
				<h2>Hire a Tub</h2>
				<HireForm />
			</section>
			{/* <section id='about'>
				<h2>About Us</h2>
				<Image
					src='/about-image.jpeg'
					width={640}
					height={732}
					className='about-image'
				/>
				<Testimonials />
				<div className='lean-to' id='about'>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Metus amet
						nibh eu sem cursus. Quam ac amet, semper consectetur ornare maecenas
						tincidunt. Sed egestas dolor vulputate orci nunc pharetra duis
						molestie. Et faucibus risus lacinia accumsan sed. Phasellus
						ultricies aliquam, nunc et nibh tellus tellus. Morbi mauris aliquet
						integer sed dui magna. Ipsum, erat tristique sit in. Lacus
						pellentesque pharetra ultrices pellentesque vestibulum. Ultrices et
						elit diam quam vitae maecenas et congue dolor. Egestas sodales risus
						dictum sit enim, ut at sed penatibus. Sed convallis orci turpis
						ullamcorper amet, amet lectus urna ultricies. Massa vitae nibh ut
						viverra.
					</p>
				</div>
			</section> */}
		</div>
	)
}

export default Home
