/**
 * GP2040 Configurator Development Server
 */

const express = require('express');
const cors = require('cors');

const controllers = require('../src/Data/Controllers.json');

const port = process.env.PORT || 8080;
const baseButtonMappings = {
	Up:    { pin: -1, key: 26, error: null },
	Down:  { pin: -1, key: 22, error: null },
	Left:  { pin: -1, key: 4 , error: null },
	Right: { pin: -1, key: 7 , error: null },
	B1:    { pin: -1, key: 11, error: null },
	B2:    { pin: -1, key: 13, error: null },
	B3:    { pin: -1, key: 28, error: null },
	B4:    { pin: -1, key: 24, error: null },
	L1:    { pin: -1, key: 18, error: null },
	R1:    { pin: -1, key: 15, error: null },
	L2:    { pin: -1, key: 12, error: null },
	R2:    { pin: -1, key: 14, error: null },
	S1:    { pin: -1, key: 42, error: null },
	S2:    { pin: -1, key: 40, error: null },
	L3:    { pin: -1, key: 19, error: null },
	R3:    { pin: -1, key: 51, error: null },
	A1:    { pin: -1, key: 0 , error: null },
	A2:    { pin: -1, key: 0, error: null },
};

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/resetSettings', (req, res) => {
	console.log('/api/resetSettings');
	return res.send({ success: true });
});

app.get('/api/getDisplayOptions', (req, res) => {
	console.log('/api/getDisplayOptions');
	const data = {
		enabled: 1,
		sdaPin: 0,
		sclPin: 1,
		i2cAddress: '0x3D',
		i2cBlock: 0,
		i2cSpeed: 400000,
		flipDisplay: 0,
		invertDisplay: 1,
		buttonLayout: 0,
		buttonLayoutRight: 3,
		splashMode: 3,
		splashChoice: 0,
		splashDuration: 0,
		splashImage: Array(16*64).fill(255),
		buttonLayoutCustomOptions:{
			params: {
				layout: 2,
				startX: 8,
				startY: 28,
				buttonRadius: 8,
				buttonPadding: 2
			},
			paramsRight: {
				layout: 9,
				startX: 8,
				startY: 28,
				buttonRadius: 8,
				buttonPadding: 2
			}
		},

		displaySaverTimeout: 0,
	}
	console.log('data', data);
	return res.send(data);
});

app.get('/api/getSplashImage', (req, res) => {
	console.log('/api/getSplashImage');
	const data = {
		splashImage: Array(16*64).fill(255)
	}
	console.log('data', data);
	return res.send(data);
});

app.get('/api/getGamepadOptions', (req, res) => {
	console.log('/api/getGamepadOptions');
	return res.send({
		dpadMode: 0,
		inputMode: 1,
		socdMode: 2,
		hotkeyF1: [ 
			{ action: 1<<1, mask: 1<<0 },
			{ action: 1<<2, mask: 1<<1 },
			{ action: 1<<3, mask: 1<<2 },
			{ action: 1<<4, mask: 1<<3 },
		 ],
		hotkeyF2: [ 
			{ action: 1<<5, mask: 1<<0 },
			{ action: 1<<6, mask: 1<<1 },
			{ action: 1<<7, mask: 1<<2 },
			{ action: 1<<8, mask: 1<<3 },
		 ]
	});
});

app.get('/api/getLedOptions', (req, res) => {
	console.log('/api/getLedOptions');
	let usedPins = [];
	for (let prop of Object.keys(controllers['pico']))
		if (!isNaN(parseInt(controllers['pico'][prop])))
			usedPins.push(parseInt(controllers['pico'][prop]));

	return res.send({
		brightnessMaximum: 255,
		brightnessSteps: 5,
		dataPin: 15,
		ledFormat: 0,
		ledLayout: 1,
		ledsPerButton: 2,
		ledButtonMap: {
			Up: 3,
			Down: 1,
			Left: 0,
			Right: 2,
			B1: 8,
			B2: 9,
			B3: 4,
			B4: 5,
			L1: 7,
			R1: 6,
			L2: 11,
			R2: 10,
			S1: null,
			S2: null,
			L3: null,
			R3: null,
			A1: null,
			A2: null,
		},
		usedPins,
	});
});

app.get('/api/getPinMappings', (req, res) => {
	console.log('/api/getPinMappings');
	let mappings = { ...baseButtonMappings };
	for (let prop of Object.keys(controllers['pico'])) {
		if (mappings[prop])
			mappings[prop] = parseInt(controllers['pico'][prop]);
	}

	return res.send(mappings);
});

app.get('/api/getKeyMappings', (req, res) => {
	console.log('/api/getKeyMappings');
	let mappings = { ...baseButtonMappings };
	for (let prop of Object.keys(baseButtonMappings)) {
		if (mappings[prop])
			mappings[prop] = parseInt(baseButtonMappings[prop].key);
	}
	return res.send(mappings);
});

app.get('/api/getAddonsOptions', (req, res) => {
	console.log('/api/getAddonsOptions');
	let usedPins = [];
	for (let prop of Object.keys(controllers['pico']))
		if (!isNaN(parseInt(controllers['pico'][prop])))
			usedPins.push(parseInt(controllers['pico'][prop]));
	return res.send({
		turboPin: -1,
		turboPinLED: -1,
		sliderLSPin: -1,
		sliderRSPin: -1,
		sliderSOCDUpPin: -1,
		sliderSOCDSecondPin: -1,
		turboShotCount: 20,
		reversePin: -1,
		reversePinLED: -1,
		reverseActionUp: 1,
		reverseActionDown: 1,
		reverseActionLeft: 1,
		reverseActionRight: 1,
		i2cAnalog1219SDAPin: -1,
		i2cAnalog1219SCLPin: -1,
		i2cAnalog1219Block: 0,
		i2cAnalog1219Speed: 400000,
		i2cAnalog1219Address: 0x40,
		onBoardLedMode: 0,
		dualDirUpPin: -1,
		dualDirDownPin: -1,
		dualDirLeftPin: -1,
		dualDirRightPin: -1,
		dualDirDpadMode: 0,
		dualDirCombineMode: 0,
		analogAdcPinX: -1,
		analogAdcPinY: -1,
		bootselButtonMap: 0,
		buzzerPin: -1,
		buzzerVolume: 100,
		extraButtonPin: -1,
		extraButtonMap: 0,
		playerNumber: 1,
		shmupMode: 0,
		shmupMixMode: 0,
		shmupAlwaysOn1: 0,
		shmupAlwaysOn2: 0,
		shmupAlwaysOn3: 0,
		shmupAlwaysOn4: 0,
		pinShmupBtn1: -1,
		pinShmupBtn2: -1,
		pinShmupBtn3: -1,
		pinShmupBtn4: -1,
		shmupBtnMask1: 0,
		shmupBtnMask2: 0,
		shmupBtnMask3: 0,
		shmupBtnMask4: 0,
		pinShmupDial: -1,
		AnalogInputEnabled: 1,
		BoardLedAddonEnabled: 1,
		BuzzerSpeakerAddonEnabled: 1,
		BootselButtonAddonEnabled: 1,
		DualDirectionalInputEnabled: 1,
		ExtraButtonAddonEnabled: 1,
		I2CAnalog1219InputEnabled: 1,
		JSliderInputEnabled: 1,
		PlayerNumAddonEnabled: 1,
		ReverseInputEnabled: 1,
		TurboInputEnabled: 1,
		usedPins,
	});
});

app.get('/api/getFirmwareVersion', (req, res) => {
	console.log('/api/getFirmwareVersion');
	return res.send({
		version: process.env.REACT_APP_CURRENT_VERSION,
	});
});

app.get('/api/getButtonLayoutCustomOptions', (req, res) => {
	console.log('/api/getButtonLayoutCustomOptions');
	return res.send({
		params: {
			layout: 2,
			startX: 8,
			startY: 28,
			buttonRadius: 8,
			buttonPadding: 2
		},
		paramsRight: {
			layout: 9,
			startX: 8,
			startY: 28,
			buttonRadius: 8,
			buttonPadding: 2
		}
	})
});

app.get('/api/reboot', (req, res) => {
	console.log('/api/reboot');
	return res.send({ });
});

app.get('/api/getMemoryReport', (req, res) => {
	console.log('/api/getMemoryReport');
	return res.send({
		totalFlash: 2048, 
        usedFlash: 1048,
        staticAllocs: 200,
        totalHeap: 2048,
        usedHeap: 1048 
	});
});

app.post('/api/*', (req, res) => {
	console.log(req.url);
	return res.send(req.body);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
