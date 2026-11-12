/**
 * Google AdSense for the web arcade (AdMob only serves native apps; on the web the same
 * Google publisher account serves ads through AdSense).
 *
 * Fill each slot with an ad unit ID from AdSense → Ads → By ad unit → Display ads.
 * A placement with an empty slot renders nothing, and the AdSense script is only loaded on
 * pages that have at least one configured placement.
 */
export const ADSENSE_CLIENT = 'ca-pub-9689152265276364';

export const AD_SLOTS = {
	/** /play/ — between the game category sections. */
	arcadeIndex: '',
	/** /play/<game>/ — under "How to play" / "Features", away from the game frame. */
	gameSidebar: '',
	/** /play/<game>/ — full-width unit above "More free games". */
	gameBottom: '',
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;

export const hasAd = (placement: AdPlacement) => AD_SLOTS[placement].trim() !== '';
