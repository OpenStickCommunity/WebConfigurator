import React, { useEffect, useState } from 'react';
import { Button, Form, Row, Col, FormCheck } from 'react-bootstrap';
import { Formik, useFormikContext } from 'formik';
import * as yup from 'yup';
import FormControl from '../Components/FormControl';
import FormSelect from '../Components/FormSelect';
import Section from '../Components/Section';
import WebApi from '../Services/WebApi';

const I2C_BLOCKS = [
	{ label: 'i2c0', value: 0 },
	{ label: 'i2c1', value: 1 },
];

const ON_BOARD_LED_MODES = [
	{ label: 'Off', value: 0 },
	{ label: 'Mode Indicator', value: 1 },
	{ label: 'Input Test', value: 2 }
];

const DUAL_STICK_MODES = [
	{ label: 'D-Pad', value: 0 },
	{ label: 'Left Analog', value: 1 },
	{ label: 'Right Analog', value: 2 },
];

const DUAL_COMBINE_MODES = [
    { label: 'Mixed', value: 0 },
	{ label: 'Gamepad', value: 1},
	{ label: 'Dual Directional', value: 2 },
	{ label: 'None', value: 3 }
];

const ANALOG_PINS = [
	-1,26,27,28
];

const BUTTON_MASKS = [
	{ label: 'None',  value:  0          },
	{ label: 'B1',    value:  (1 << 0)   },
	{ label: 'B2',    value:  (1 << 1)   },
	{ label: 'B3',    value:  (1 << 2)   },
	{ label: 'B4',    value:  (1 << 3)   },
	{ label: 'L1',    value:  (1 << 4)   },
	{ label: 'R1',    value:  (1 << 5)   },
	{ label: 'L2',    value:  (1 << 6)   },
	{ label: 'R2',    value:  (1 << 7)   },
	{ label: 'S1',    value:  (1 << 8)   },
	{ label: 'S2',    value:  (1 << 9)   },
	{ label: 'L3',    value:  (1 << 10)  },
	{ label: 'R3',    value:  (1 << 11)  },
	{ label: 'A1',    value:  (1 << 12)  },
	{ label: 'A2',    value:  (1 << 13)  },
	{ label: 'Up',    value:  (1 << 14)  },
	{ label: 'Down',  value:  (1 << 15)  },
	{ label: 'Left',  value:  (1 << 16)  },
	{ label: 'Right', value:  (1 << 17)  },
]

const schema = yup.object().shape({
	turboPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Turbo Pin'),
	turboPinLED: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Turbo Pin LED'),
	sliderLSPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Slider LS Pin'),
	sliderRSPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Slider RS Pin'),
	turboShotCount: yup.number().required().min(5).max(30).label('Turbo Shot Count'),
	reversePin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Reverse Pin'),
	reversePinLED: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Reverse Pin LED'),
	i2cAnalog1219SDAPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('I2C Analog1219 SDA Pin'),
	i2cAnalog1219SCLPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('I2C Analog1219 SCL Pin'),
	i2cAnalog1219Block: yup.number().required().oneOf(I2C_BLOCKS.map(o => o.value)).label('I2C Analog1219 Block'),
	i2cAnalog1219Speed: yup.number().required().label('I2C Analog1219 Speed'),
	i2cAnalog1219Address: yup.number().required().label('I2C Analog1219 Address'),
	onBoardLedMode: yup.number().required().oneOf(ON_BOARD_LED_MODES.map(o => o.value)).label('On-Board LED Mode'),
	dualDirUpPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Dual Directional Up Pin'),
	dualDirDownPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Dual Directional Down Pin'),
	dualDirLeftPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Dual Directional Left Pin'),
	dualDirRightPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Dual Directional Right Pin'),
	dualDirDpadMode : yup.number().required().oneOf(DUAL_STICK_MODES.map(o => o.value)).label('Dual Stick Mode'), 
	dualDirCombineMode : yup.number().required().oneOf(DUAL_COMBINE_MODES.map(o => o.value)).label('Dual Combination Mode'),
	analogAdcPinX : yup.number().required().test('', '${originalValue} is unavailable/already assigned!', (value) => usedPins.indexOf(value) === -1).label('Analog Stick Pin X'),
 	analogAdcPinY : yup.number().required().test('', '${originalValue} is unavailable/already assigned!', (value) => usedPins.indexOf(value) === -1).label('Analog Stick Pin Y'),
	bootselButtonMap : yup.number().required().oneOf(BUTTON_MASKS.map(o => o.value)).label('BOOTSEL Button Map'),
	buzzerPin: yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Buzzer Pin'),
	buzzerVolume: yup.number().required().min(0).max(100).label('Buzzer Volume'),
	AnalogInputEnabled: yup.number().required().label('Analog Input Enabled'),
	BoardLedAddonEnabled: yup.number().required().label('Board LED Add-On Enabled'),
	BuzzerSpeakerAddonEnabled: yup.number().required().label('Buzzer Speaker Add-On Enabled'),
	BootselButtonAddonEnabled: yup.number().required().label('Boot Select Button Add-On Enabled'),
	DualDirectionalInputEnabled: yup.number().required().label('Dual Directional Input Enabled'),
	I2CAnalog1219InputEnabled: yup.number().required().label('I2C Analog1219 Input Enabled'),
	JSliderInputEnabled: yup.number().required().label('JSlider Input Enabled'),
	ReverseInputEnabled: yup.number().required().label('Reverse Input Enabled'),
	TurboInputEnabled: yup.number().required().label('Turbo Input Enabled')
});

const defaultValues = {
	turboPin: -1,
	turboPinLED: -1,
	sliderLSPin: -1,
	sliderRSPin: -1,
	turboShotCount: 5,
	reversePin: -1,
	reversePinLED: -1,
	i2cAnalog1219SDAPin: -1,
	i2cAnalog1219SCLPin: -1,
	i2cAnalog1219Block: 0,
	i2cAnalog1219Speed: 400000,
	i2cAnalog1219Address: 0x40,
	onBoardLedMode: 0,
	dualUpPin: -1,
	dualDownPin: -1,
	dualLeftPin: -1,
	dualRightPin: -1,
	dualDirDpadMode: 0,
	dualDirCombineMode: 0,
	analogAdcPinX : -1,
 	analogAdcPinY : -1,
	bootselButtonMap: 0,
	buzzerPin: -1,
	buzzerVolume: 100,
	AnalogInputEnabled: 0,
	BoardLedAddonEnabled: 0,
	BuzzerSpeakerAddonEnabled: 0,
	BootselButtonAddonEnabled: 0,
	DualDirectionalInputEnabled: 0,
	I2CAnalog1219InputEnabled: 0,
	JSliderInputEnabled: 0,
	ReverseInputEnabled: 0,
	TurboInputEnabled: 0
};

const REVERSE_ACTION = [
	{ label: 'Disable', value: 0 },
	{ label: 'Enable', value: 1 },
	{ label: 'Neutral', value: 2 },
];

let usedPins = [];

const FormContext = () => {
	const { values, setValues } = useFormikContext();

	useEffect(() => {
		async function fetchData() {
			const data = await WebApi.getAddonsOptions();
			usedPins = data.usedPins;
			setValues(data);
		}
		fetchData();
	}, [setValues]);

	useEffect(() => {
		if (!!values.turboPin)
			values.turboPin = parseInt(values.turboPin);
		if (!!values.turboPinLED)
			values.turboPinLED = parseInt(values.turboPinLED);
		if (!!values.sliderLSPin)
			values.sliderLSPin = parseInt(values.sliderLSPin);
		if (!!values.sliderRSPin)
			values.sliderRSPin = parseInt(values.sliderRSPin);
		if (!!values.turboShotCount)
			values.turboShotCount = parseInt(values.turboShotCount);
		if (!!values.reversePin)
			values.reversePin = parseInt(values.reversePin);
		if (!!values.reversePinLED)
			values.reversePinLED = parseInt(values.reversePinLED);
		if (!!values.reverseActionUp)
			values.reverseActionUp = parseInt(values.reverseActionUp);
		if (!!values.reverseActionDown)
			values.reverseActionDown = parseInt(values.reverseActionDown);
		if (!!values.reverseActionLeft)
			values.reverseActionLeft = parseInt(values.reverseActionLeft);
		if (!!values.reverseActionRight)
			values.reverseActionRight = parseInt(values.reverseActionRight);
		if (!!values.i2cAnalog1219SDAPin)
			values.i2cAnalog1219SDAPin = parseInt(values.i2cAnalog1219SDAPin);
		if (!!values.i2cAnalog1219SCLPin)
			values.i2cAnalog1219SCLPin = parseInt(values.i2cAnalog1219SCLPin);
		if (!!values.i2cAnalog1219Block)
			values.i2cAnalog1219Block = parseInt(values.i2cAnalog1219Block);
		if (!!values.i2cAnalog1219Speed)
			values.i2cAnalog1219Speed = parseInt(values.i2cAnalog1219Speed);
		if (!!values.i2cAnalog1219Address)
			values.i2cAnalog1219Address = parseInt(values.i2cAnalog1219Address);
		if (!!values.onBoardLedMode)
			values.onBoardLedMode = parseInt(values.onBoardLedMode);
		if (!!values.dualDownPin)
			values.dualDownPin = parseInt(values.dualDownPin);
		if (!!values.dualUpPin)
			values.dualUpPin = parseInt(values.dualUpPin);
		if (!!values.dualLeftPin)
			values.dualLeftPin = parseInt(values.dualLeftPin);
		if (!!values.dualRightPin)
			values.dualRightPin = parseInt(values.dualRightPin);
		if (!!values.dualDirMode)
			values.dualDirMode = parseInt(values.dualDirMode);
		if (!!values.analogAdcPinX)
			values.analogAdcPinX = parseInt(values.analogAdcPinX);
		if (!!values.analogAdcPinY)
			values.analogAdcPinY = parseInt(values.analogAdcPinY);
		if (!!values.bootselButtonMap)
			values.bootselButtonMap = parseInt(values.bootselButtonMap);
		if (!!values.buzzerPin)
			values.buzzerPin = parseInt(values.buzzerPin);
		if (!!values.buzzerVolume)
			values.buzzerVolume = parseInt(values.buzzerVolume);
		if (!!values.AnalogInputEnabled)
			values.AnalogInputEnabled = parseInt(values.AnalogInputEnabled);
		if (!!values.BoardLedAddonEnabled)
			values.BoardLedAddonEnabled = parseInt(values.BoardLedAddonEnabled);
		if (!!values.BuzzerSpeakerAddonEnabled)
			values.BuzzerSpeakerAddonEnabled = parseInt(values.BuzzerSpeakerAddonEnabled);
		if (!!values.BootselButtonAddonEnabled)
			values.BootselButtonAddonEnabled = parseInt(values.BootselButtonAddonEnabled);
		if (!!values.DualDirectionalInputEnabled)
			values.DualDirectionalInputEnabled = parseInt(values.DualDirectionalInputEnabled);
		if (!!values.I2CAnalog1219InputEnabled)
			values.I2CAnalog1219InputEnabled = parseInt(values.I2CAnalog1219InputEnabled);
		if (!!values.JSliderInputEnabled)
			values.JSliderInputEnabled = parseInt(values.JSliderInputEnabled);
		if (!!values.ReverseInputEnabled)
			values.ReverseInputEnabled = parseInt(values.ReverseInputEnabled);
		if (!!values.TurboInputEnabled)
			values.TurboInputEnabled = parseInt(values.TurboInputEnabled);
	}, [values, setValues]);

	return null;
};

export default function AddonsConfigPage() {
	const [saveMessage, setSaveMessage] = useState('');

	const onSuccess = async (values) => {
		const success = WebApi.setAddonsOptions(values);
		setSaveMessage(success ? 'Saved! Please Restart Your Device' : 'Unable to Save');
	};

	const handleCheckbox = async (name, values) => {
		values[name] = values[name] === 1 ? 0 : 1;
	};

	return (
	<Formik enableReinitialize={true} validationSchema={schema} onSubmit={onSuccess} initialValues={defaultValues}>
			{({
				handleSubmit,
				handleChange,
				handleBlur,
				values,
				touched,
				errors,
			}) => (
				<Form noValidate onSubmit={handleSubmit}>
					<Section title="Add-Ons Configuration">
						<p>Use the form below to reconfigure add-on options in GP2040-CE.</p>
					</Section>
					<Section title="BOOTSEL Button Configuration">
						<div
							id="BootselButtonAddonOptions"
							hidden={!values.BootselButtonAddonEnabled}>
							<p>Note: OLED might become unresponsive if button is set, unset to restore.</p>
							<FormSelect
								label="BOOTSEL Button"
								name="bootselButtonMap"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.bootselButtonMap}
								error={errors.bootselButtonMap}
								isInvalid={errors.bootselButtonMap}
								onChange={handleChange}
							>
								{BUTTON_MASKS.map((o, i) => <option key={`bootselButtonMap-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="BootselButtonAddonButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.BootselButtonAddonEnabled)}
							onChange={(e) => { handleCheckbox("BootselButtonAddonEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="On-Board LED Configuration">
						<div
							id="BoardLedAddonEnabledOptions"
							hidden={!values.BoardLedAddonEnabled}>
							<FormSelect
								label="LED Mode"
								name="onBoardLedMode"
								className="form-select-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.onBoardLedMode}
								error={errors.onBoardLedMode}
								isInvalid={errors.onBoardLedMode}
								onChange={handleChange}>
								{ON_BOARD_LED_MODES.map((o, i) => <option key={`onBoardLedMode-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="BoardLedAddonButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.BoardLedAddonEnabled)}
							onChange={(e) => {handleCheckbox("BoardLedAddonEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="Analog">
						<div
							id="AnalogInputOptions"
							hidden={!values.AnalogInputEnabled}>
						<p>Available pins: {ANALOG_PINS.join(", ")}</p>
						<Row class="mb-3">
							<FormSelect
								label="Analog Stick X Pin"
								name="analogAdcPinX"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.analogAdcPinX}
								error={errors.analogAdcPinX}
								isInvalid={errors.analogAdcPinX}
								onChange={handleChange}
							>
								{ANALOG_PINS.map((i) => <option key={`analogPins-option-${i}`} value={i}>{i}</option>)}
							</FormSelect>
							<FormSelect
								label="Analog Stick Y Pin"
								name="analogAdcPinY"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.analogAdcPinY}
								error={errors.analogAdcPinY}
								isInvalid={errors.analogAdcPinY}
								onChange={handleChange}
							>
								{ANALOG_PINS.map((i) => <option key={`analogPins-option-${i}`} value={i}>{i}</option>)}
							</FormSelect>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="AnalogInputButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.AnalogInputEnabled)}
							onChange={(e) => {handleCheckbox("AnalogInputEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="Turbo">
						<div
							id="TurboInputOptions"
							hidden={!values.TurboInputEnabled}>
						<Row class="mb-3">
							<FormControl type="number"
								label="Turbo Pin"
								name="turboPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.turboPin}
								error={errors.turboPin}
								isInvalid={errors.turboPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Turbo Pin LED"
								name="turboPinLED"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.turboPinLED}
								error={errors.turboPinLED}
								isInvalid={errors.turboPinLED}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Turbo Shot Count"
								name="turboShotCount"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.turboShotCount}
								error={errors.turboShotCount}
								isInvalid={errors.turboShotCount}
								onChange={handleChange}
								min={2}
								max={30}
							/>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="TurboInputButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.TurboInputEnabled)}
							onChange={(e) => {handleCheckbox("TurboInputEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="Joystick Selection Slider">
						<div
							id="JSliderInputOptions"
							hidden={!values.JSliderInputEnabled}>
						<Row class="mb-3">
							<FormControl type="number"
								label="Slider LS Pin"
								name="sliderLSPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.sliderLSPin}
								error={errors.sliderLSPin}
								isInvalid={errors.sliderLSPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Slider RS Pin"
								name="sliderRSPin"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.sliderRSPin}
								error={errors.sliderRSPin}
								isInvalid={errors.sliderRSPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="JSliderInputButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.JSliderInputEnabled)}
							onChange={(e) => {handleCheckbox("JSliderInputEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="Input Reverse">
						<div
							id="ReverseInputOptions"
							hidden={!values.ReverseInputEnabled}>
						<Row class="mb-3">
							<FormControl type="number"
								label="Reverse Input Pin"
								name="reversePin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.reversePin}
								error={errors.reversePin}
								isInvalid={errors.reversePin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Reverse Input Pin LED"
								name="reversePinLED"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.reversePinLED}
								error={errors.reversePinLED}
								isInvalid={errors.reversePinLED}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
						</Row>
						<Row class="mb-3">
							<FormSelect
								label="Reverse Up"
								name="reverseActionUp"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.reverseActionUp}
								error={errors.reverseActionUp}
								isInvalid={errors.reverseActionUp}
								onChange={handleChange}
							>
								{REVERSE_ACTION.map((o, i) => <option key={`reverseActionUp-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
							<FormSelect
								label="Reverse Down"
								name="reverseActionDown"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.reverseActionDown}
								error={errors.reverseActionDown}
								isInvalid={errors.reverseActionDown}
								onChange={handleChange}
							>
								{REVERSE_ACTION.map((o, i) => <option key={`reverseActionDown-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
							<FormSelect
								label="Reverse Left"
								name="reverseActionLeft"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.reverseActionLeft}
								error={errors.reverseActionLeft}
								isInvalid={errors.reverseActionLeft}
								onChange={handleChange}
							>
								{REVERSE_ACTION.map((o, i) => <option key={`reverseActionLeft-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
							<FormSelect
								label="Reverse Right"
								name="reverseActionRight"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.reverseActionRight}
								error={errors.reverseActionRight}
								isInvalid={errors.reverseActionRight}
								onChange={handleChange}
							>
								{REVERSE_ACTION.map((o, i) => <option key={`reverseActionRight-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="ReverseInputButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.ReverseInputEnabled)}
							onChange={(e) => {handleCheckbox("ReverseInputEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="I2C Analog ADS1219">
						<div
							id="I2CAnalog1219InputOptions"
							hidden={!values.I2CAnalog1219InputEnabled}>
						<Row class="mb-3">
							<FormControl type="number"
								label="I2C Analog ADS1219 SDA Pin"
								name="i2cAnalog1219SDAPin"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.i2cAnalog1219SDAPin}
								error={errors.i2cAnalog1219SDAPin}
								isInvalid={errors.i2cAnalog1219SDAPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="I2C Analog ADS1219 SCL Pin"
								name="i2cAnalog1219SCLPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.i2cAnalog1219SCLPin}
								error={errors.i2cAnalog1219SCLPin}
								isInvalid={errors.i2cAnalog1219SCLPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormSelect
								label="I2C Analog ADS1219 Block"
								name="i2cAnalog1219Block"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.i2cAnalog1219Block}
								error={errors.i2cAnalog1219Block}
								isInvalid={errors.i2cAnalog1219Block}
								onChange={handleChange}
							>
								{I2C_BLOCKS.map((o, i) => <option key={`i2cBlock-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
							<FormControl
								label="I2C Analog ADS1219 Speed"
								name="i2cAnalog1219Speed"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.i2cAnalog1219Speed}
								error={errors.i2cAnalog1219Speed}
								isInvalid={errors.i2cAnalog1219Speed}
								onChange={handleChange}
								min={100000}
							/>
						</Row>
						<Row class="mb-3">
							<FormControl
								label="I2C Analog ADS1219 Address"
								name="i2cAnalog1219Address"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.i2cAnalog1219Address}
								error={errors.i2cAnalog1219Address}
								isInvalid={errors.i2cAnalog1219Address}
								onChange={handleChange}
								maxLength={4}
							/>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="I2CAnalog1219InputButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.I2CAnalog1219InputEnabled)}
							onChange={(e) => {handleCheckbox("I2CAnalog1219InputEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="Dual Directional Input">
						<div
							id="DualDirectionalInputOptions"
							hidden={!values.DualDirectionalInputEnabled}>
						<Row class="mb-3">
							<FormControl type="number"
								label="Dual Up Pin"
								name="dualDirUpPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.dualDirUpPin}
								error={errors.dualDirUpPin}
								isInvalid={errors.dualDirUpPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Dual Down Pin"
								name="dualDirDownPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.dualDirDownPin}
								error={errors.dualDirDownPin}
								isInvalid={errors.dualDirDownPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Dual Left Pin"
								name="dualDirLeftPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.dualDirLeftPin}
								error={errors.dualDirLeftPin}
								isInvalid={errors.dualDirLeftPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Dual Right Pin"
								name="dualDirRightPin"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.dualDirRightPin}
								error={errors.dualDirRightPin}
								isInvalid={errors.dualDirRightPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
						</Row>
						<Row class="mb-3">
							<FormSelect
								label="Dual D-Pad Mode"
								name="dualDirDpadMode"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.dualDirDpadMode}
								error={errors.dualDirDpadMode}
								isInvalid={errors.dualDirDpadMode}
								onChange={handleChange}
							>
								{DUAL_STICK_MODES.map((o, i) => <option key={`button-dualDirDpadMode-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>

							<FormSelect
								label="Combination Mode"
								name="dualDirCombineMode"
								className="form-select-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.dualDirCombineMode}
								error={errors.dualDirCombineMode}
								isInvalid={errors.dualDirCombineMode}
								onChange={handleChange}
							>
								{DUAL_COMBINE_MODES.map((o, i) => <option key={`button-dualDirCombineMode-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="DualDirectionalInputButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.DualDirectionalInputEnabled)}
							onChange={(e) => {handleCheckbox("DualDirectionalInputEnabled", values); handleChange(e);}}
						/>
					</Section>
					<Section title="Buzzer Speaker">
						<div
							id="BuzzerSpeakerAddonOptions"
							hidden={!values.BuzzerSpeakerAddonEnabled}>
						<Row class="mb-3">	
							<FormControl type="number"
								label="Buzzer Pin"
								name="buzzerPin"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.buzzerPin}
								error={errors.buzzerPin}
								isInvalid={errors.buzzerPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormControl type="number"
								label="Buzzer Volume"
								name="buzzerVolume"
								className="form-control-sm"
								groupClassName="col-sm-3 mb-3"
								value={values.buzzerVolume}
								error={errors.buzzerVolume}
								isInvalid={errors.buzzerVolume}
								onChange={handleChange}
								min={0}
								max={100}
							/>
						</Row>
						</div>
						<FormCheck
							label="Enabled"
							type="switch"
							id="BuzzerSpeakerAddonButton"
							reverse="true"
							error={false}
							isInvalid={false}
							checked={Boolean(values.BuzzerSpeakerAddonEnabled)}
							onChange={(e) => {handleCheckbox("BuzzerSpeakerAddonEnabled", values); handleChange(e);}}
						/>
					</Section>
					<div className="mt-3">
						<Button type="submit">Save</Button>
						{saveMessage ? <span className="alert">{saveMessage}</span> : null}
					</div>
					<FormContext />
				</Form>
			)}
		</Formik>
	);
}
