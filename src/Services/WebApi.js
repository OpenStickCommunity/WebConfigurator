import axios from 'axios';
import { chunk } from 'lodash';
import { intToHex, hexToInt, rgbIntToHex } from './Utilities';

const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';

export const baseButtonMappings = {
	Up:    { pin: -1, error: null },
	Down:  { pin: -1, error: null },
	Left:  { pin: -1, error: null },
	Right: { pin: -1, error: null },
	B1:    { pin: -1, error: null },
	B2:    { pin: -1, error: null },
	B3:    { pin: -1, error: null },
	B4:    { pin: -1, error: null },
	L1:    { pin: -1, error: null },
	R1:    { pin: -1, error: null },
	L2:    { pin: -1, error: null },
	R2:    { pin: -1, error: null },
	S1:    { pin: -1, error: null },
	S2:    { pin: -1, error: null },
	L3:    { pin: -1, error: null },
	R3:    { pin: -1, error: null },
	A1:    { pin: -1, error: null },
	A2:    { pin: -1, error: null },
};

async function resetSettings() {
	return axios.get(`${baseUrl}/api/resetSettings`)
		.then((response) => response.data)
		.catch(console.error);
}

async function getDisplayOptions() {
	return axios.get(`${baseUrl}/api/getDisplayOptions`)
		.then((response) => {
			if (response.data.i2cAddress)
				response.data.i2cAddress = '0x' + response.data.i2cAddress.toString(16);
			response.data.splashDuration = response.data.splashDuration / 1000; // milliseconds to seconds 
			response.data.displaySaverTimeout = response.data.displaySaverTimeout / 60000; // milliseconds to minutes 

			return response.data;
		})
		.catch(console.error);
}

async function setDisplayOptions(options, isPreview) {
	let newOptions = sanitizeRequest(options);
	newOptions.i2cAddress = parseInt(options.i2cAddress);
	newOptions.buttonLayout = parseInt(options.buttonLayout);
	newOptions.buttonLayoutRight = parseInt(options.buttonLayoutRight);
	newOptions.splashMode = parseInt(options.splashMode);
	newOptions.splashDuration = parseInt(options.splashDuration) * 1000; // seconds to milliseconds
	newOptions.displaySaverTimeout = parseInt(options.displaySaverTimeout) * 60000; // minutes to milliseconds
	newOptions.splashChoice = parseInt(options.splashChoice);
	
	if (newOptions.buttonLayoutCustomOptions) {
		newOptions.buttonLayoutCustomOptions.params.layout = parseInt(options.buttonLayoutCustomOptions?.params?.layout);
		newOptions.buttonLayoutCustomOptions.paramsRight.layout = parseInt(options.buttonLayoutCustomOptions?.paramsRight?.layout);
	}

	delete newOptions.splashImage;
	const url = !isPreview ? `${baseUrl}/api/setDisplayOptions` : `${baseUrl}/api/setPreviewDisplayOptions`;
	return axios.post(url, newOptions)
		.then((response) => {
			console.log(response.data);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}

async function getSplashImage() {
	return axios.get(`${baseUrl}/api/getSplashImage`)
		.then((response) => {
			return response.data;
		}).catch(console.error);
}

async function setSplashImage({splashImage}) {
	return axios.post(`${baseUrl}/api/setSplashImage`, {
		splashImage: btoa(String.fromCharCode.apply(null, new Uint8Array(splashImage)))
	}).then((response) => {
		return response.data;
	}).catch(console.error);
}

async function getGamepadOptions() {
	return axios.get(`${baseUrl}/api/getGamepadOptions`)
		.then((response) => response.data)
		.catch(console.error);
}

async function setGamepadOptions(options) {
	return axios.post(`${baseUrl}/api/setGamepadOptions`, sanitizeRequest(options))
		.then((response) => {
			console.log(response.data);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}

async function getLedOptions() {
	return axios.get(`${baseUrl}/api/getLedOptions`)
		.then((response) => {
			// Transform ARGB int value to hex for easy use on frontend
			Object.keys(response.data.customLeds)
				.forEach((p) => {
					response.data.customLeds[p] = {
						normal: `#${rgbIntToHex(response.data.customLeds[p].normal)}`,
						pressed: `#${rgbIntToHex(response.data.customLeds[p].pressed)}`,
					};
				});

			// Add synthetic 'ALL' option
			if (!response.data.customLeds['ALL'])
				response.data.customLeds['ALL'] = { normal: '#000000', pressed: '#000000' };

			console.log(response.data);
			return response.data;
		})
		.catch(console.error);
}

async function setLedOptions(options) {
	let data = sanitizeRequest(options);

	// Transform RGB hex values to ARGB int before sending back to API
	Object.keys(data.customLeds)
		.forEach((p) => {
			data.customLeds[p] = {
				normal: hexToInt(data.customLeds[p].normal.replace('#', '')),
				pressed: hexToInt(data.customLeds[p].pressed.replace('#', '')),
			};
		});

	return axios.post(`${baseUrl}/api/setLedOptions`, sanitizeRequest(options))
		.then((response) => {
			console.log(response.data);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}

async function getPinMappings() {
	return axios.get(`${baseUrl}/api/getPinMappings`)
		.then((response) => {
			let mappings = { ...baseButtonMappings };
			for (let prop of Object.keys(response.data))
				mappings[prop].pin = parseInt(response.data[prop]);

			return mappings;
		})
		.catch(console.error);
}

async function setPinMappings(mappings) {
	let data = {};
	Object.keys(mappings).map((button, i) => data[button] = mappings[button].pin);

	return axios.post(`${baseUrl}/api/setPinMappings`, sanitizeRequest(data))
		.then((response) => {
			console.log(response.data);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}

async function getKeyMappings() {
	return axios.get(`${baseUrl}/api/getKeyMappings`)
		.then((response) => {
			let mappings = { ...baseButtonMappings };
			for (let prop of Object.keys(response.data))
				mappings[prop].key = parseInt(response.data[prop]);

			return mappings;
		})
		.catch(console.error);
}

async function setKeyMappings(mappings) {
	let data = {};
	Object.keys(mappings).map((button, i) => data[button] = mappings[button].key);

	return axios.post(`${baseUrl}/api/setKeyMappings`, sanitizeRequest(data))
		.then((response) => {
			console.log(response.data);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}
async function getAddonsOptions() {
	return axios.get(`${baseUrl}/api/getAddonsOptions`)
		.then((response) => response.data)
		.catch(console.error);
}

async function setAddonsOptions(options) {
	return axios.post(`${baseUrl}/api/setAddonsOptions`, sanitizeRequest(options))
		.then((response) => {
			console.log(response.data);
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}

async function getFirmwareVersion() {
	return axios.get(`${baseUrl}/api/getFirmwareVersion`)
		.then((response) => response.data)
		.catch(console.error);
}

async function getMemoryReport() {
	return axios.get(`${baseUrl}/api/getMemoryReport`)
		.then((response) => response.data)
		.catch(console.error);
}

async function reboot(bootMode) {
	return axios.post(`${baseUrl}/api/reboot`, { bootMode })
		.then((response) => response.data)
		.catch(console.error);
}

function sanitizeRequest(request) {
	const newRequest = {...request};
	delete newRequest.usedPins;
	delete newRequest.ALL; // Synthetic option for custom LEDs
	return newRequest;
}

const WebApi = {
	resetSettings,
	getDisplayOptions,
	setDisplayOptions,
	getGamepadOptions,
	setGamepadOptions,
	getLedOptions,
	setLedOptions,
	getPinMappings,
	setPinMappings,
	getKeyMappings,
	setKeyMappings,
	getAddonsOptions,
	setAddonsOptions,
	getSplashImage,
	setSplashImage,
	getFirmwareVersion,
	getMemoryReport,
	reboot
};

export default WebApi;
