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
