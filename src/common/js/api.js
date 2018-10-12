import * as lscache from "lscache";
import hash from "hash.js";

import * as config from "./config.js";

/**
 * Time in minutes that cached API requests remain in localStorage.
 * @type {integer}
 */
const CACHE_EXPIRATION = config.apiCacheExpiration;

/**
 * Generates a cache key based on the provided URL, method, and data.
 * @param  {string} url    The URL of the request.
 * @param  {string} method The HTTP method type of the request.
 * @param  {object} data   An JSON compatible object with all request data. 
 * @return {string}        A cache key derived from the parameters.
 */
function cacheKeyGenerate(url, method, data=null)
{
	const hashData = url + method + JSON.stringify(data);
	return hash.sha256().update(hashData).digest("hex");
}

/**
 * Successful fetch operation callback.
 *
 * @typedef {function} onSuccessCallback
 * @param {object} data An decoded JSON object containering the data from the fetch.
 */

/**
 * Failed fetch operation callback.
 *
 * @typedef {function} onErrorCallback
 * @param {object} error An error object containing error data from the fetch.
 */

/**
 * 
 * @param  {string}		url    		The URL of the request.
 * @param  {string}		method 		The HTTP method type of the request.
 * @param  {object}		data   		An JSON compatible object with all request data. 
 * @param  {Boolean}	useCache	If true, a cached response will be returned if available.
 * @param  {onSuccessCallback} onSuccess A function called on successful execution. 
 * @param  {onFailureCallback} onError	 A function called on a failed execution.
 * @return {Promise} The resulting promise of the request.
 */
export function fetchUrl(url, method="GET", data=null, useCache=false)
{
	const cacheKey = cacheKeyGenerate(url, method, data);
	const apiUrl = apiUrlFromRelativePath(url);

	log.debug("URL:", apiUrl);
	log.debug("Data:", data);

	// Check for cached response.
	if(useCache)
	{
		const cachedResponse = lscache.get(cacheKey);
		if(cachedResponse !== null)
		{
			const json = JSON.parse(cachedResponse);

			log.debug("Cached JSON:", json);

			return Promise.resolve(json);
		}
	}

	const config =
	{
		method,
		cache: "no-cache",
		credentials: "include",
		headers:
		{
			"Content-Type": "application/json",
		},
		redirect: "follow",
		referrer: "no-referrer",
		body: (data) ? JSON.stringify(data) : data,
	};

	const promise = fetch(apiUrl, config)
	.then(async function(response)
	{
		log.debug("Fetch response:", response);

		const code = response.status;
		const json = await response.json();

		log.debug("Fetch JSON:", json);

		lscache.set(cacheKey, JSON.stringify(json), CACHE_EXPIRATION);

		return json;
	})
	.catch(function(error)
	{
		throw reformatError(error);
	})

	return promise;
}

/**
 * Coerces an error object into a JSON compatible object. 
 * @param  {object} errorObj An error object.
 * @return {object} A JSON compatible object
 */
export function reformatError(errorObj)
{
	if("error" in errorObj && typeof errorObj.error === "string")
		return errorObj.error;

	let error = String(errorObj);

	if(error === "TypeError: Failed to fetch")
		error = "Failed to connect to server.";
	else if(error.match("^SyntaxError"))
		error = "Unexpected response from server.";

	return error;
}

/**
 * Removes a cache entry matching the specified parameters.
 * @param  {string} url    The URL of the request.
 * @param  {string} method The HTTP method type of the request.
 * @param  {object} data   An JSON compatible object with all request data. 
 * @return {void}
 */
export function removeCache(url, method, data=null)
{
	const cacheKey = cacheKeyGenerate(url, method, data);
	lscache.remove(cacheKey);
}

/**
 * Updates the cache entrying matching the specified parameters
 * @param  {string} url    The URL of the request.
 * @param  {string} method The HTTP method type of the request.
 * @param  {object} data   An JSON compatible object with all request data. 
 * @param  {object} newData   An JSON compatible object with the replacement response data. 
 * @return {void}
 */
export function updateCache(url, method, data=null, newData=null)
{
	const cacheKey = cacheKeyGenerate(url, method, data);
	lscache.set(cacheKey, JSON.stringify(newData), CACHE_EXPIRATION);
}

export function apiUrlFromRelativePath(relativeUrl)
{
	const baseUrl = (__DEV__ && Cookies.get("baseUrl")) ? Cookies.get("baseUrl") : window.location.origin;
	let url = relativeUrl;

	if(baseUrl !== false)
	{
		url = url.replace(window.location.origin, "");
		url = baseUrl + url;
		log.debug("apiUrl:", url);
	}

	return url;
}

export function getUrl(url, useCache=false)
{
	return fetchUrl(url, "GET", null, useCache);
}

export function postUrl(url, data, useCache=false)
{
	return fetchUrl(url, "POST", data, useCache);
}

export function patchUrl(url, data, useCache=false)
{
	return fetchUrl(url, "PATCH", data, useCache);
}

export function deleteUrl(url, useCache=false)
{
	return fetchUrl(url, "DELETE", null, useCache);
}
