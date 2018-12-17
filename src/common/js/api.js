import * as lscache from "lscache";
import hash from "hash.js";
import * as loading from "../../components/Loading/loading.js";

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
 * @param  {Boolean}	background	If true, will execute fetch in background mode without loading indicators.
 * @param  {onSuccessCallback} onSuccess A function called on successful execution. 
 * @param  {onFailureCallback} onError	 A function called on a failed execution.
 * @return {Promise} The resulting promise of the request.
 */
export function fetchUrl(url, method="GET", data=null, useCache=false, background=false)
{
	method = method.toUpperCase();
	const cacheKey = cacheKeyGenerate(url, method, data);
	const apiUrl = apiUrlFromRelativePath(url);

	log.debug("FETCH URL:", apiUrl);
	log.debug("FETCH DATA:", data);
	log.debug("USE CACHE:", useCache);

	if(!background)
		loading.show();

	// Check for cached response. Never cache when FormData is submitted since that is not considered in the cache key.
	if(useCache && !(data instanceof FormData))
	{
		const cachedResponse = lscache.get(cacheKey);
		if(cachedResponse !== null)
		{
			const json = JSON.parse(cachedResponse);

			log.debug("Cached JSON:", json);

			if(!background)
				loading.hide();

			return Promise.resolve(json);
		}
	}

	// Invalidate cache when a new request will occur.
	removeCache(url, method, data);

	// Always convert data into a FormData object.
	let formData = null;
	if(data)
	{
		// If formData is not a FormData instance, assume it is a JSON compatible object.
		if(data instanceof FormData)
			formData = data;
		else
		{
			formData = new FormData();
			Object.keys(data).forEach(function(key)
			{
				formData.append(key, data[key]);
			});
		}
	}

	const config =
	{
		method,
		cache: "no-cache",
		credentials: "include",
		redirect: "follow",
		referrer: "no-referrer",
		body: formData,
	};

	const promise = fetch(apiUrl, config)
	.then(async function(response)
	{
		log.debug("Fetch response:", response);

		const code = response.status;
		log.debug("Fetch CODE:", code);

		if(code !== 200)
		{
			const body = await response.text();
			throw reformatError(body);
		}

		const json = await response.json();
		log.debug("Fetch JSON:", json);

		lscache.set(cacheKey, JSON.stringify(json), CACHE_EXPIRATION);

		if(!background)
			loading.hide();

		return json;
	})
	.catch(function(error)
	{
		if(!background)
			loading.hide();

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
	if(_.isObject(errorObj) && _.has(errorObj, "error") && _.isString(errorObj.error))
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
export function removeCache(url, method="GET", data=null)
{
	method = method.toUpperCase();
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

export function getUrl(url, useCache=false, background=false)
{
	return fetchUrl(url, "GET", null, useCache, background);
}

export function postUrl(url, data, useCache=false, background=false)
{
	return fetchUrl(url, "POST", data, useCache, background);
}

export function patchUrl(url, data, useCache=false, background=false)
{
	return fetchUrl(url, "PATCH", data, useCache, background);
}

export function putUrl(url, data, useCache=false, background=false)
{
	return fetchUrl(url, "PUT", data, useCache, background);
}

export function deleteUrl(url, useCache=false, background=false)
{
	return fetchUrl(url, "DELETE", null, useCache, background);
}
