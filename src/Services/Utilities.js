// Convert a hex string to a number
const hexToInt = (hex) => {
	return parseInt(hex, 16);
};

// Convert a number to hex
const intToHex = (d) => {
	return ("0"+(Number(d).toString(16))).slice(-2).toLowerCase();
};

// Convert a 32-bit ARGB value to hex format (no # prefix)
const rgbIntToHex = (rgbInt) => {
	let r = (rgbInt >> 16) & 255;
	let g = (rgbInt >> 8) & 255;
	let b = (rgbInt >> 0) & 255;

	return `${intToHex(r)}${intToHex(g)}${intToHex(b)}`;
}

// Takes an array of 8-bit RGB values and returns the hex value
const rgbArrayToHex = (values) => {
	let [r, g, b] = values;

	if (!(r >= 0 && r <= 255))
		r = 0;
	if (!(g >= 0 && g <= 255))
		g = 0;
	if (!(b >= 0 && b <= 255))
		r = 0;

	return `#${intToHex(r)}${intToHex(g)}${intToHex(b)}`;
};

export {
	hexToInt,
	intToHex,
	rgbArrayToHex,
	rgbIntToHex,
};
