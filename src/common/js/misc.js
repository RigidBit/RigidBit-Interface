import moment from "moment";

/**
 * Convert a hex string into an ASCII string.
 *
 * Modified from source: https://stackoverflow.com/a/46611380/9979
 * 
 * @param  {String} str A hex string.
 * @return {String} An ASCII string.    
 */
export function hexToAscii(inputString)
{
	const hexString = String(inputString)
	let stringOut = "";

	for(let i = 0; i < hexString.length; i += 2)
		stringOut += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));

	return stringOut;    
}

/**
 * Convert a decimal array to a hex string.
 *
 * Based on source: https://stackoverflow.com/a/57805/9979
 * 
 * @param  {Array} decimalArray An array of decimals.
 * @return {String} A hex string.
 */
export function decimalArrayToHex(decimalArray)
{
	let stringOut = "";

	decimalArray.forEach(function(decimal)
	{
		stringOut += decimal.toString(16);
	});

	return stringOut;
}

/**
 * Convert a decimal array to an ASCII string.
 * @param  {Array} decimalArray An array of decimals.
 * @return {String} An ASCII string.
 */
export function decimalArrayToAscii(decimalArray)
{
	return hexToAscii(decimalArrayToHex(decimalArray));
}

/**
 * Converts an array of uint into a UTF-8 compatible string.
 *
 * Source: // https://stackoverflow.com/a/17192845/9979
 * 
 * @param  {Array} uintArray An array of uints.
 * @return {String}          A UTF-8 string.
 */
export function uintToString(uintArray)
{
	const encodedString = String.fromCharCode.apply(null, uintArray);
	const decodedString = decodeURIComponent(escape(encodedString));

	return decodedString;
}

/**
 * Return the value from the specified collection at the specified key, or zero if the key does not exist.
 * @param  {Object} collection The object to be queried.
 * @param  {String} key        The desired key.
 * @return {*}            The value matching the specificed key, or 0.
 */
export function valueOrZero(collection, key)
{
	return (key in collection) ? collection[key] : 0;
}

/**
 * Returns a zero width space character.
 * @return {String} A single zero width space character.
 */
export function zeroWidthSpace()
{
	return "​";
}

/**
 * Convert a Unix timestamp to a formatted date.
 * @param  {Number} timestamp A Unix timestamp. 
 * @return {String}           A formatted date string.
 */
export function timestampToDate(timestamp)
{
	const zws = zeroWidthSpace();
	return moment(new Date(parseInt(timestamp) * 1000)).format("YYYY-MM-DDT"+zws+"HH:mm:ss");
}

/**
 * Find the extension of a filename.
 * 
 * Source: https://stackoverflow.com/a/680982/9979
 * 
 * @param  {String} filename The filename to process.
 * @return {String|null}     The filename extension if found, or null if no extension was found.
 */
export function filenameExtension(filename)
{
	const re = /(?:\.([^.]+))?$/;
	const result = re.exec(filename)[1];

	if(typeof result === "undefined")
		return null;

	return result;
}

/**
 * Takes a string and uppercases the first letter of each word.
 *
 * Source: https://github.com/kvz/locutus/blob/master/src/php/strings/ucwords.js
 * 
 * @param  {String} str The string to be processed.
 * @return {String}     The resulting string.
 */
export function ucwords(str)
{
	return (str + '')
		.replace(/^(.)|\s+(.)/g, function ($1)
		{
			return $1.toUpperCase()
		});
}


/**
 * The splice() method changes the content of a string by removing a range of
 * characters and/or adding new characters.
 *
 * Source: https://stackoverflow.com/a/4314050/9979
 *
 * @param {number} start Index at which to start changing the string.
 * @param {number} delCount An integer indicating the number of old chars to remove.
 * @param {string} newSubStr The String that is spliced in.
 * @return {string} A new string with the spliced substring.
 */

if(!String.prototype.splice)
{
	String.prototype.splice = function(start, delCount, newSubStr)
	{
		return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
	};
}

/**
 * Inserts a zero width space at the specified string index.
 * @param  {String} string The input string.
 * @param  {Number} index  The index to insert the zero width space.
 * @return {String}        The resulting string.
 */
export function insertZeroWidthSpaceAt(string, index)
{
	return String(string).splice(index, 0, zeroWidthSpace());
}

/**
 * Convert a hex color string to RGB components.
 *
 * Modified from source: https://stackoverflow.com/a/11508164/9979
 * 
 * @param  {String} hexColor A six character hex color string.
 * @return {Object} An object with rgb components.
 */
export function hexToRgb(hexColor)
{
	const bigint = parseInt(hexColor.replace("#", ""), 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return {r, g, b};
}

/**
 * Converts a hex color string to a luminance value.
 *
 *	Derived from sources:
 *	* https://stackoverflow.com/a/3943023/9979
 *	* https://plnkr.co/edit/OWc1K3?p=preview
 * 
 * @param  {String} hexColor A six character hex color string.
 * @return {Number}          A luminance value.
 */
export function calculateLuminance(hexColor)
{
	const color = hexToRgb(hexColor);

	const calculateLight = (colorItem) =>
	{
		let c = colorItem / 255.0;

		if(c <= 0.03928)
			c = c / 12.92;
		else
			c = Math.pow((c + 0.055) / 1.055, 2.4);

		return c;
	};

	return 0.2126 * calculateLight(color.r) + 0.7152 * calculateLight(color.g) + 0.0722 * calculateLight(color.b)
}

/**
 * Calculates the contrast color based on the supplied hex color.
 * @param  {String} hexColor A six character hex color string.
 * @return {String}          A six character hex color string.
 */
export function calculateContrastColor(hexColor)
{
	if(calculateLuminance(hexColor) > 0.379)
		return "333333";
	else
		return "ffffff";
}
