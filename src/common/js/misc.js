import hash from "hash.js";
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
 * Find the filename component of a file path.
 *
 * Source: https://stackoverflow.com/a/423385/9979
 * 
 * @param  {String} filePath A filename with full path.
 * @return {String}          The filename.
 */
export function filenameFromPath(filePath)
{
	return filePath.replace(/^.*[\\\/]/, '');
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
		return "";

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

/**
 * Checks if string is valid JSON.
 *
 * Source: https://stackoverflow.com/a/3710226/9979
 * 
 * @param  {String}  string The string to check.
 * @return {Boolean}        True if string is valid JSON, otherwise false.
 */
export function isJson(string)
{
	try
	{
		JSON.parse(string);
	}
	catch(e)
	{
		return false;
	}
	return true;
}

/**
 * Returns the RigidBit logo in base64 encoding.
 * 
 * @return {String} A string containing the logo data in base64 encoding.
 */
export function rigidBitLogo()
{
	return "data:image/png;base64,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";
}

/**
 * Creates a SHA256 hash from the file selected.
 *
 * Heavily modified from source: https://stackoverflow.com/a/28318964/9979
 * 
 * @param  {File} file A File object. Typically passed from an <input type="file">.
 * @return {Promise} Returns a promise containing either the file hash on success, or the error on failure.
 */
export function hashFile(file)
{
	const promise = new Promise((resolve, reject) =>
	{
		const fileSize = file.size;
		const chunkSize = 64 * 1024;

		let hasher = hash.sha256();
		let offset = 0;

		const errorHandler = function(e)
		{
			const error = _.get(e, "target.error.message", e);
			reject(error);
		};

		const readHandler = function(e)
		{
			if(e.target.error === null)
			{
				hasher.update(new Uint8Array(e.target.result));
				offset += e.target.result.byteLength;
			}
			else
				return errorHandler(e);

			if(offset >= fileSize)
				return resolve(hasher.digest("hex"));

			// Read next chunk.
			chunkReader(offset, chunkSize, file);
		};

		const chunkReader = function(offset, length, file)
		{
			const reader = new FileReader();
			const blob = file.slice(offset, length + offset);

			reader.onabort = errorHandler;
			reader.onerror = errorHandler;
			reader.onload = readHandler;
			reader.readAsArrayBuffer(blob);
		};

		// Read the first chunk.
		chunkReader(offset, chunkSize, file);
	});

	return promise;
}

/**
 * Determines if the specified path is a Windows path.
 * 
 * @param  {String}  path The path to be tested.
 * @return {Boolean}      True if the path is a Windows path, otherwise false.
 */
export function isWindowsPath(path)
{
	const regex1 = /^[a-z]:\\.*/gi;
	const regex2 = /^\\\\.*/gi;

	return regex1.test(path) || regex2.test(path);
}

/**
 * Hashes the specified password with the default salt.
 * 
 * @param  {String} password A string of the password to hash.
 * @return {String}          A string of the hashed password.
 */
export function hashPassword(password)
{
	return hash.sha256().update(config.loginPasswordSalt).update(password).digest("hex");
}

/**
 * Generate a random integer.
 *
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * 
 * @param  {Integer} min The minimum value.
 * @param  {Integer} max The maximum limit. The output value will always be less than this. 
 * @return {Integer}     A random integer.
 */
export function getRandomInt(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Map data values returned from the /api/variables endpoint to the global config object. 
 * 
 * @param  {Object} data A data object returned from the /api/variables endpoint.
 */
export function mapApiVariablesToConfig(data)
{
	config.loginPasswordSalt = data.salt;
	config.settingsEventsEventRuleActionActions = data.event_action_types;
	config.settingsEventsEventRuleConditionObjects = data.event_object_types;
	config.settingsEventsEventRuleConditionOperators = data.event_condition_operators;
	config.settingsEventsEventRuleRuleTypes = data.event_types;
	config.statusUsageDays = data.status_usage_days;
}

/**
 * Converts a CamelCase string into individual words.
 *
 * Source: https://stackoverflow.com/a/18379358/9979
 * 
 * @param  {string} data A CamelCase string.
 * @return {string}      A split word string.
 */
export function camelCaseToWords(data)
{
	return data.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}
