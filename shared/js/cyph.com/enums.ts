/**
 * Possible states of cyph.com UI.
 */
export enum States {
	checkout,
	contact,
	donate,
	home,
	error,
	faq,
	pricing,
	privacypolicy,
	termsofservice
}

/**
 * Map of URL states to page titles.
 */
export const pageTitles	= {
	about: `About Cyph`,
	betalist: `Cyph – BetaList`,
	checkout: `Cyph - Checkout`,
	contact: `Get in Touch with Cyph`,
	default: `Cyph – Encrypted Messenger`,
	donate: `Donate to Cyph`,
	error: `Page Not Found`,
	faq: `Frequently Asked Questions`,
	features: `Cyph's Features`,
	gettingstarted: `Getting Started with Cyph`,
	intro: `Introduction to Cyph`,
	invite: `Cyph Account Invite`,
	jjgo: `Cyph – Jordan, Jesse, Go!`,
	judgejohn: `Cyph – Judge John Hodgman`,
	mybrother: `Cyph – My Brother, My Brother and Me`,
	penn: `Cyph – Penn's Sunday School`,
	pricing: `Cyph Pricing`,
	privacypolicy: `Cyph's Privacy Policy`,
	register: `Cyph Account Signup`,
	sawbones: `Cyph – Sawbones`,
	security: `Cyph – The Security Brief`,
	termsofservice: `Cyph's Terms of Service`,
	testimonials: `What People Say about Cyph`,
	ventura: `Cyph – We The People`
};

/**
 * Possible states of home page.
 */
export enum HomeSections {
	about,
	features,
	gettingstarted,
	intro,
	invite,
	promo,
	register,
	testimonials
}

/**
 * Possible states of promo promo page.
 */
export enum Promos {
	betalist,
	jjgo,
	judgejohn,
	mybrother,
	none,
	penn,
	sawbones,
	security,
	ventura
}
