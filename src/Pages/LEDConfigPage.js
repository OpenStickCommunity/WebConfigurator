import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Formik, useFormikContext } from 'formik';
import orderBy from 'lodash/orderBy';
import { SketchPicker } from '@hello-pangea/color-picker';

import { AppContext } from '../Contexts/AppContext';
import ColorPicker from '../Components/ColorPicker';
import Section from '../Components/Section';
import DraggableListGroup from '../Components/DraggableListGroup';
import FormControl from '../Components/FormControl';
import FormSelect from '../Components/FormSelect';
import BUTTONS from '../Data/Buttons.json';
import LEDColors from '../Data/LEDColors';
import { hexToInt, rgbIntToHex } from '../Services/Utilities';
import yup from '../Services/Validator';
import WebApi from '../Services/WebApi';

const LED_FORMATS = [
	{ label: 'GRB', value: 0 },
	{ label: 'RGB', value: 1 },
	{ label: 'GRBW', value: 2 },
	{ label: 'RGBW', value: 3 },
];

const BUTTON_LAYOUTS = [
	{ label: '8-Button Layout', value: 0 },
	{ label: 'Hit Box Layout', value: 1 },
	{ label: 'WASD Layout', value: 2 },
];

const PLED_LABELS = [
	{ 0: 'PLED #1 Pin', 1: 'PLED #1 Index' },
	{ 0: 'PLED #2 Pin', 1: 'PLED #2 Index' },
	{ 0: 'PLED #3 Pin', 1: 'PLED #3 Index' },
	{ 0: 'PLED #4 Pin', 1: 'PLED #4 Index' },
];

const defaultValue = {
	brightnessMaximum: 255,
	brightnessSteps: 5,
	dataPin: -1,
	ledFormat: 0,
	ledLayout: 0,
	ledsPerButton: 2,
	pledColor: '#00ff00',
};

const usedPins = [];

const schema = yup.object().shape({
	brightnessMaximum : yup.number().required().positive().integer().min(0).max(255).label('Max Brightness'),
	brightnessSteps   : yup.number().required().positive().integer().min(1).max(10).label('Brightness Steps'),
	// eslint-disable-next-line no-template-curly-in-string
	dataPin           : yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Data Pin'),
	ledFormat         : yup.number().required().positive().integer().min(0).max(3).label('LED Format'),
	ledLayout         : yup.number().required().positive().integer().min(0).max(2).label('LED Layout'),
	ledsPerButton     : yup.number().required().positive().integer().min(1).label('LEDs Per Pixel'),
	pledType          : yup.number().required().integer().min(-1).max(1).label('Player LED Type'),
	pledColor         : yup.string().label('RGB Player LEDs').validateColor(),
	pledPin1          : yup.number().label('PLED 1').validatePinWhenEnabled('pledPins1', usedPins),
	pledPin2          : yup.number().label('PLED 2').validatePinWhenEnabled('pledPins2', usedPins),
	pledPin3          : yup.number().label('PLED 3').validatePinWhenEnabled('pledPins3', usedPins),
	pledPin4          : yup.number().label('PLED 4').validatePinWhenEnabled('pledPins4', usedPins),
// 	pledIndex1        : yup.number().label('PLED 1').validateNumberWhenEnabled('pledIndex1'),
// 	pledIndex2        : yup.number().label('PLED 2').validateNumberWhenEnabled('pledIndex2'),
// 	pledIndex3        : yup.number().label('PLED 3').validateNumberWhenEnabled('pledIndex3'),
// 	pledIndex4        : yup.number().label('PLED 4').validateNumberWhenEnabled('pledIndex4'),
});

const getLedButtons = (buttonLabels, map, excludeNulls) => {
	return orderBy(
		Object
			.keys(BUTTONS[buttonLabels])
			.filter(p => p !== 'label' && p !== 'value')
			.filter(p => excludeNulls ? map[p] > -1 : true)
			.map(p => ({ id: p, label: BUTTONS[buttonLabels][p], value: map[p] })),
		"value"
	);
}

const getLedMap = (buttonLabels, ledButtons, excludeNulls) => {
	if (!ledButtons)
		return;

	const map = Object
		.keys(BUTTONS[buttonLabels])
		.filter(p => p !== 'label' && p !== 'value')
		.filter(p => excludeNulls ? ledButtons[p].value > -1 : true)
		.reduce((p, n) => { p[n] = null; return p }, {});

	for (let i = 0; i < ledButtons.length; i++)
		map[ledButtons[i].id] = i;

	return map;
}

const FormContext = ({ buttonLabels, ledButtonMap, ledFormat, pledColor, pledType, pledPin1, pledPin2, pledPin3, pledPin4, setDataSources }) => {
	const { setFieldValue, setValues } = useFormikContext();

	useEffect(() => {
		async function fetchData() {
			const data = await WebApi.getLedOptions();
			data.pledColor = rgbIntToHex(data.pledColor) || "#ffffff";

			let available = {};
			let assigned = {};

			Object.keys(data.ledButtonMap).forEach(p => {
				if (data.ledButtonMap[p] === null)
					available[p] = data.ledButtonMap[p];
				else
					assigned[p] = data.ledButtonMap[p];
			});

			const dataSources = [
				getLedButtons(buttonLabels, available, true),
				getLedButtons(buttonLabels, assigned, true),
			];
			usedPins.push(...data.usedPins);
			setDataSources(dataSources);
			setValues(data);
		}
		fetchData();
	}, [buttonLabels]);

	useEffect(() => {
		if (!!ledFormat)
			setFieldValue('ledFormat', parseInt(ledFormat));
	}, [ledFormat, setFieldValue]);
	
	useEffect(() => {
		setFieldValue('ledButtonMap', ledButtonMap);
	}, [ledButtonMap, setFieldValue]);
	
	useEffect(() => {
		if (!!pledPin1)
			setFieldValue('pledPin1', parseInt(pledPin1));
	}, [pledPin1, setFieldValue]);
	useEffect(() => {
		if (!!pledPin2)
			setFieldValue('pledPin2', parseInt(pledPin2));
	}, [pledPin2, setFieldValue]);
	useEffect(() => {
		if (!!pledPin3)
			setFieldValue('pledPin3', parseInt(pledPin3));
	}, [pledPin3, setFieldValue]);
	useEffect(() => {
		if (!!pledPin4)
			setFieldValue('pledPin4', parseInt(pledPin4));
	}, [pledPin4, setFieldValue]);
	useEffect(() => {
		if (!!pledColor)
			setFieldValue('pledColor', pledColor);
	}, [pledColor, setFieldValue]);

	return null;
};

export default function LEDConfigPage() {
	const { buttonLabels } = useContext(AppContext);
	const [saveMessage, setSaveMessage] = useState('');
	const [ledButtonMap, setLedButtonMap] = useState([]);
	const [dataSources, setDataSources] = useState([[], []]);
	const [colorPickerTarget, setColorPickerTarget] = useState(null);
	const [showPicker, setShowPicker] = useState(false);

	const ledOrderChanged = (ledOrderArrays) => {
		if (ledOrderArrays.length === 2)
			setLedButtonMap(getLedMap(buttonLabels, ledOrderArrays[1]));
	};

	const setPledColor = (values, hexColor) => {
		values.pledColor = hexColor;
	};

	const showRgbPledPicker = (e) => {
		setColorPickerTarget(e.target);
		setShowPicker(true);
	};
	
	const toggleRgbPledPicker = (e) => {
		e.stopPropagation();
		setColorPickerTarget(e.target);
		setShowPicker(!showPicker);
	};

	const onSuccess = async (values) => {
		const data = { ...values };
		data.pledType = parseInt(values.pledType);
		if (data.pledColor)
			data.pledColor = hexToInt(values.pledColor);

		const success = await WebApi.setLedOptions(data);
		setSaveMessage(success ? 'Saved! Please Restart Your Device' : 'Unable to Save');
	};

	return (
		<Formik validationSchema={schema} onSubmit={onSuccess} initialValues={defaultValue} validateOnChange={true}>
			{({
				handleSubmit,
				handleChange,
				handleBlur,
				values,
				touched,
				errors,
			}) => (
				<Form noValidate onSubmit={handleSubmit}>
					<Section title="RGB LED Configuration">
						<Row>
							<FormControl type="number"
								label="Data Pin (-1 for disabled)"
								name="dataPin"
								className="form-control-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.dataPin}
								error={errors.dataPin}
								isInvalid={errors.dataPin}
								onChange={handleChange}
								min={-1}
								max={29}
							/>
							<FormSelect
								label="LED Format"
								name="ledFormat"
								className="form-select-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.ledFormat}
								error={errors.ledFormat}
								isInvalid={errors.ledFormat}
								onChange={handleChange}
								>
								{LED_FORMATS.map((o, i) => <option key={`ledFormat-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
							<FormSelect
								label="LED Layout"
								name="ledLayout"
								className="form-select-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.ledLayout}
								error={errors.ledLayout}
								isInvalid={errors.ledLayout}
								onChange={handleChange}
							>
								{BUTTON_LAYOUTS.map((o, i) => <option key={`ledLayout-option-${i}`} value={o.value}>{o.label}</option>)}
							</FormSelect>
						</Row>
						<Row>
							<FormControl type="number"
								label="LEDs Per Button"
								name="ledsPerButton"
								className="form-control-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.ledsPerButton}
								error={errors.ledsPerButton}
								isInvalid={errors.ledsPerButton}
								onChange={handleChange}
								min={1}
							/>
							<FormControl type="number"
								label="Max Brightness"
								name="brightnessMaximum"
								className="form-control-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.brightnessMaximum}
								error={errors.brightnessMaximum}
								isInvalid={errors.brightnessMaximum}
								onChange={handleChange}
								min={0}
								max={255}
							/>
							<FormControl type="number"
								label="Brightness Steps"
								name="brightnessSteps"
								className="form-control-sm"
								groupClassName="col-sm-4 mb-3"
								value={values.brightnessSteps}
								error={errors.brightnessSteps}
								isInvalid={errors.brightnessSteps}
								onChange={handleChange}
								min={1}
								max={10}
							/>
						</Row>
					</Section>
					<Section title="RGB Player LEDs (XInput)">
						<Form.Group as={Col}>
							<Row>
								<FormSelect
									label="Player LED Type"
									name="pledType"
									className="form-select-sm"
									groupClassName="col-sm-2 mb-3"
									value={values.pledType}
									error={errors.pledTypet}
									isInvalid={errors.pledType}
									onChange={handleChange}
								>
									<option value="-1" defaultValue={true}>Off</option>
									<option value="0">PWM</option>
									<option value="1">RGB</option>
								</FormSelect>
								{parseInt(values.pledType) > -1 &&
									<>
										<FormControl type="number"
											label={PLED_LABELS[0][values.pledType]}
											className="form-control-sm"
											groupClassName="col-sm-2 mb-3"
											key={'pledPin1'}
											name={'pledPin1'}
											value={values.pledPin1}
											error={errors.pledPin1}
											isInvalid={errors.pledPin1}
											onChange={handleChange}
											min={0}
										/>
										<FormControl type="number"
											label={PLED_LABELS[1][values.pledType]}
											className="form-control-sm"
											groupClassName="col-sm-2 mb-3"
											key={'pledPin2'}
											name={'pledPin2'}
											value={values.pledPin2}
											error={errors.pledPin2}
											isInvalid={errors.pledPin2}
											onChange={handleChange}
											min={0}
										/>
										<FormControl type="number"
											label={PLED_LABELS[2][values.pledType]}
											className="form-control-sm"
											groupClassName="col-sm-2 mb-3"
											key={'pledPin3'}
											name={'pledPin3'}
											value={values.pledPin3}
											error={errors.pledPin3}
											isInvalid={errors.pledPin3}
											onChange={handleChange}
											min={0}
										/>
										<FormControl type="number"
											label={PLED_LABELS[3][values.pledType]}
											className="form-control-sm"
											groupClassName="col-sm-2 mb-3"
											key={'pledPin4'}
											name={'pledPin4'}
											value={values.pledPin4}
											error={errors.pledPin4}
											isInvalid={errors.pledPin4}
											onChange={handleChange}
											min={0}
										/>
									</>
								}
								{parseInt(values.pledType) === 1 &&
									<>
										<FormControl
											label="RGB PLED Color"
											name="pledColor"
											className="form-control-sm"
											groupClassName="col-sm-2 mb-3"
											value={values.pledColor}
											error={errors.pledColor}
											isInvalid={errors.pledColor}
											onBlur={handleBlur}
											onClick={toggleRgbPledPicker}
											onChange={(e) => {
												handleChange(e);
												setShowPicker(false);
											}}
										/>
										<ColorPicker
											name="pledColor"
											types={[{ value: values.pledColor }]}
											onChange={(c, e) => setPledColor(values, c)}
											onDismiss={(e) => setShowPicker(false)}
											placement="bottom"
											presetColors={LEDColors.map(c => ({ title: c.name, color: c.value}))}
											show={showPicker}
											target={colorPickerTarget}
										></ColorPicker>
									</>
								}
							</Row>
						</Form.Group>
					</Section>
					<Section title="RGB LED Button Order">
						<p className="card-text">
							Here you can define which buttons have RGB LEDs and in what order they run from the control board.
							This is required for certain LED animations and static theme support.
						</p>
						<p className="card-text">
							Drag and drop list items to assign and reorder the RGB LEDs.
						</p>
						<DraggableListGroup
							groupName="test"
							titles={['Available Buttons', 'Assigned Buttons']}
							dataSources={dataSources}
							onChange={ledOrderChanged}
						/>
					</Section>
					<Button type="submit">Save</Button>
					{saveMessage ? <span className="alert">{saveMessage}</span> : null}
					<FormContext {...{
						buttonLabels,
						ledButtonMap,
						setDataSources,
						ledFormat: values.ledFormat
					}} />
				</Form>
			)}
		</Formik>
	);
}
