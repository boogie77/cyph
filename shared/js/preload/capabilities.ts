/**
 * @file Redirect browsers that don't have required capabilities.
 */


if (!(
	'crypto' in self &&
	'getRandomValues' in (<any> self).crypto &&
	'Worker' in self &&
	'history' in self &&
	'pushState' in (<any> self).history &&
	'replaceState' in (<any> self).history &&
	'MutationObserver' in self &&
	'localStorage' in self &&

	/* Test for https://github.com/jedisct1/libsodium.js/issues/28 */
	(<any> self).sodium.crypto_box_easy(
		new Uint8Array([
			104, 101, 108, 108, 111
		]),
		new Uint8Array([
			40, 215, 22, 91, 91, 180, 87, 4, 192, 247, 77, 251, 196,
			27, 142, 61, 244, 35, 104, 20, 95, 95, 197, 149
		]),
		new Uint8Array([
			223, 162, 89, 100, 113, 45, 229, 188, 95, 111, 94, 74, 70, 122, 23, 233, 74,
			32, 125, 142, 194, 33, 146, 174, 167, 128, 231, 205, 34, 63, 202, 84
		]),
		new Uint8Array([
			65, 66, 51, 47, 154, 177, 254, 27, 245, 25, 115, 89, 136, 153, 175, 121, 196,
			147, 57, 223, 131, 180, 150, 172, 229, 99, 71, 234, 252, 116, 75, 64
		]),
		'hex'
	) === '7a47747857c2560f2dea0e5acca7497209465d5419'
)) {
	location.pathname	= '/unsupportedbrowser';
}
