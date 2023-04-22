import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import FormCheck from 'react-bootstrap/FormCheck';
import { SketchPicker } from '@hello-pangea/color-picker';
import { Formik, useFormikContext } from 'formik';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import * as yup from 'yup';

import { AppContext } from '../Contexts/AppContext';
import Section from '../Components/Section';
import DraggableListGroup from '../Components/DraggableListGroup';
import FormControl from '../Components/FormControl';
import FormSelect from '../Components/FormSelect';
import WebApi from '../Services/WebApi';
import { BUTTONS, MAIN_BUTTONS, AUX_BUTTONS } from '../Data/Buttons';
import LEDColors from '../Data/LEDColors';

import './LEDConfigPage.scss';

const LED_FORMATS = [
	{ label: 'GRB', value: 0 },
	{ label: 'RGB', value: 1 },
	{ label: 'GRBW', value: 2 },
	{ label: 'RGBW', value: 3 },
];

const BUTTON_LAYOUTS = [
	{
		label: 'Stick',
		value: 0,
		stickLayout: 'standard',
	},
	{
		label: 'Stickless',
		value: 1,
		stickLayout: 'stickless',
	},
	{
		label: 'WASD',
		value: 2,
		stickLayout: 'keyboard',
	},
];

const defaultCustomLeds = Object.keys(BUTTONS.gp2040)
	?.filter(p => p !== 'label' && p !== 'value')
	.reduce((a, p) => {
		a[p] = { normal: '#000000', pressed: '#000000' };
		return a;
	}, {});

defaultCustomLeds['ALL'] = { normal: '#000000', pressed: '#000000' };

const defaultValue = {
	brightnessMaximum: 255,
	brightnessSteps: 5,
	dataPin: -1,
	ledFormat: 0,
	ledLayout: 0,
	ledsPerButton: 2,
};

let usedPins = [];

const schema = yup.object().shape({
	brightnessMaximum : yup.number().required().positive().integer().min(0).max(255).label('Max Brightness'),
	brightnessSteps   : yup.number().required().positive().integer().min(1).max(10).label('Brightness Steps'),
	// eslint-disable-next-line no-template-curly-in-string
	dataPin           : yup.number().required().min(-1).max(29).test('', '${originalValue} is already assigned!', (value) => usedPins.indexOf(value) === -1).label('Data Pin'),
	ledFormat         : yup.number().required().positive().integer().min(0).max(3).label('LED Format'),
	ledLayout         : yup.number().required().positive().integer().min(0).max(2).label('LED Layout'),
	ledsPerButton      : yup.number().required().positive().integer().min(1).label('LEDs Per Pixel'),
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

const LEDButton = ({ id, name, buttonType, buttonColor, buttonPressedColor, className, labelUnder, onClick, ...props }) => {
	const [pressed, setPressed] = useState(false);

	const handlePressedShow = (e) => {
		// Show pressed state on right-click
		if (e.button === 2)
			setPressed(true);
	};

	const handlePressedHide = (e) => {
		// Revert to normal state
		setPressed(false);
	};

	return (
		<div
			className={`led-button ${className}`}
			style={{ backgroundColor: pressed ? buttonPressedColor : buttonColor }}
			onClick={onClick}
			onMouseDown={(e) => handlePressedShow(e)}
			onMouseUp={(e) => handlePressedHide(e)}
			onMouseLeave={(e) => handlePressedHide(e)}
			onContextMenu={(e) => e.preventDefault()}
		>
			<span className={`button-label ${labelUnder ? 'under' : ''}`}>{name}</span>
		</div>
	);
};

const FormContext = ({ buttonLabels, ledButtonMap, ledFormat, setDataSources, setCustomLeds, setUseCustomLeds }) => {
	const { setFieldValue, setValues } = useFormikContext();

	useEffect(() => {
		async function fetchData() {
			const data = await WebApi.getLedOptions();

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
			usedPins = data.usedPins;
			setDataSources(dataSources);
			setValues(data);
			setUseCustomLeds(data.useCustomLeds);
			if (!data.customLeds['ALL'])
				data.customLeds['ALL'] = { normal: '#000000', pressed: '#000000' };
			setCustomLeds(data.customLeds);
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

	return null;
};

export default function LEDConfigPage() {
	const { buttonLabels } = useContext(AppContext);
	const [saveMessage, setSaveMessage] = useState('');
	const [ledButtonMap, setLedButtonMap] = useState([]);
	const [dataSources, setDataSources] = useState([[], []]);
	const [pickerType, setPickerType] = useState(null);
	const [selectedButton, setSelectedButton] = useState('');
	const [selectedColor, setSelectedColor] = useState('#000000');
	const [useCustomLeds, setUseCustomLeds] = useState(false);
	const [customLeds, setCustomLeds] = useState({ ...defaultCustomLeds });
	const [ledOverlayTarget, setLedOverlayTarget] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);

	const ledOrderChanged = (ledOrderArrays) => {
		if (ledOrderArrays.length === 2)
			setLedButtonMap(getLedMap(buttonLabels, ledOrderArrays[1]));
	};

	const toggleSelectedButton = (e, buttonName) => {
		e.stopPropagation();
		if (selectedButton === buttonName) {
			setSelectedButton(null);
		}
		else {
			setLedOverlayTarget(e.target);
			setSelectedButton(buttonName);
			setSelectedColor(buttonName === 'ALL' ? '#000000' : customLeds[buttonName].normal);
			setPickerType({ type: 'normal', button: buttonName });
		}
	};

	const confirmClearAll = () => {
		setLedOverlayTarget(null);
		setSelectedButton(null);
		setSelectedColor(null);

		// Reset all custom LEDs
		Object.keys(customLeds).forEach((b, i) => {
			Object.keys(customLeds[b]).forEach((s, i) => {
				customLeds[b][s] = '#000000';
			});
		});
		setCustomLeds(customLeds);
		setModalVisible(false);
	};

	const handleLedColorClick = (pickerType) => {
		setSelectedColor(customLeds[selectedButton][pickerType]);
		setPickerType({ type: pickerType, button: selectedButton });
	};

	const handleLedColorChange = (c) => {
		if (selectedButton) {
			if (selectedButton === 'ALL')
				Object.keys(customLeds).forEach(p => customLeds[p][pickerType.type] = c.hex);
			else
				customLeds[selectedButton][pickerType.type] = c.hex;
		}

		setCustomLeds(customLeds);
		setSelectedColor(c);
	};

	const handleLedColorDeselect = (e) => {
		setSelectedButton('');
	};

	const toggleCustomLeds = (e) => {
		setUseCustomLeds(e.target.checked);
	};

	const onSuccess = async (values) => {
		const leds = { ...customLeds };
		delete leds['ALL'];
		const success = WebApi.setLedOptions({ ...values, useCustomLeds, customLeds: leds });
		setSaveMessage(success ? 'Saved! Please Restart Your Device' : 'Unable to Save');
	};

	return (
		<Formik validationSchema={schema} onSubmit={onSuccess} initialValues={defaultValue}>
			{({
				handleSubmit,
				handleChange,
				handleBlur,
				values,
				touched,
				errors,
			}) => (
				<Form noValidate onSubmit={handleSubmit}>
					<Section title="LED Configuration">
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
					<Section title="LED Button Order">
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
					<Section title="Custom LED Theme">
						<div>
							<p>
								Here you can enable and configure a custom LED theme.
								The custom theme will be selectable using the Next and Previous Animation shortcuts on your controller.
							</p>
							{useCustomLeds &&
								<>
									<Stack>
										<div className="d-flex justify-content-between">
											<div className="d-flex d-none d-md-block">
												<ul>
													<li>Click a button to bring up the normal and pressed color selection.</li>
													<li>Click on the controller background to dismiss the color selection.</li>
													<li>Right-click a button to preview the button's pressed color.</li>
												</ul>
											</div>
											<FormSelect
												label="LED Layout"
												name="ledLayout"
												value={values.ledLayout}
												error={errors.ledLayout}
												isInvalid={errors.ledLayout}
												onChange={handleChange}
												style={{ width: 150 }}
											>
												{BUTTON_LAYOUTS.map((o, i) => <option key={`ledLayout-option-${i}`} value={o.value}>{o.label}</option>)}
											</FormSelect>
										</div>
										<div className="d-flex led-preview-container">
											<div
												className={`led-preview led-preview-${BUTTON_LAYOUTS[values.ledLayout]?.stickLayout}`}
												onClick={(e) => handleLedColorDeselect(e)}
												onContextMenu={(e) => e.preventDefault()}
											>
												<div className="container-aux">
													{AUX_BUTTONS.map(buttonName => (
														<LEDButton
															key={`led-button-${buttonName}`}
															className={`${buttonName} ${selectedButton === buttonName ? 'selected' : ''}`}
															name={BUTTONS[buttonLabels][buttonName]}
															buttonColor={customLeds[buttonName]?.normal}
															buttonPressedColor={customLeds[buttonName]?.pressed}
															labelUnder={true}
															onClick={(e) => toggleSelectedButton(e, buttonName)}
														/>
													))}
												</div>
												<div className="container-main">
													{MAIN_BUTTONS.map(buttonName => (
														<LEDButton
															key={`led-button-${buttonName}`}
															className={`${buttonName} ${selectedButton === buttonName ? 'selected' : ''}`}
															name={BUTTONS[buttonLabels][buttonName]}
															buttonColor={customLeds[buttonName]?.normal}
															buttonPressedColor={customLeds[buttonName]?.pressed}
															labelUnder={false}
															onClick={(e) => toggleSelectedButton(e, buttonName)}
														/>
													))}
												</div>
											</div>
										</div>
									</Stack>
									<ButtonGroup>
										<Button onClick={(e) => setModalVisible(true)}>Clear All</Button>
										<Button onClick={(e) => toggleSelectedButton(e, 'ALL')}>Set All To Color</Button>
									</ButtonGroup>
								</>
							}
							<Overlay
								show={!!selectedButton}
								target={ledOverlayTarget}
								placement="top"
								container={this}
								containerPadding={20}
							>
								<Popover>
									<Container className="led-color-picker">
										<h5 className="text-center">{selectedButton === 'ALL' ? selectedButton : BUTTONS[buttonLabels][selectedButton]}</h5>
										<Form.Group as={Row}
											className={`led-color-option ${pickerType?.type === 'normal' ? 'selected' : ''}`}
											onClick={() => handleLedColorClick('normal')}
										>
											<Form.Label column lg={8} className="p-3">Normal</Form.Label>
											<Col sm={2}>
												<div
													className={`led-color led-color-normal`}
													style={{ backgroundColor: customLeds[selectedButton]?.normal }}
												></div>
											</Col>
										</Form.Group>
										<Form.Group as={Row}
											className={`led-color-option ${pickerType?.type === 'pressed' ? 'selected' : ''}`}
											onClick={() => handleLedColorClick('pressed')}
										>
											<Form.Label column lg={8} className="p-3">Pressed</Form.Label>
											<Col sm={2}>
												<div
													className={`led-color led-color-pressed`}
													style={{ backgroundColor: customLeds[selectedButton]?.pressed }}
												></div>
											</Col>
										</Form.Group>
										<Row>
											<Col>
												<SketchPicker
													color={selectedColor}
													onChange={(c) => handleLedColorChange(c)}
													disableAlpha={true}
													presetColors={LEDColors.map(c => ({ title: c.name, color: c.value}))}
													width={180}
												/>
											</Col>
										</Row>
									</Container>
								</Popover>
							</Overlay>
						</div>
						<FormCheck
							label="Enable"
							type="switch"
							id="useCustomLeds"
							reverse="true"
							error={undefined}
							isInvalid={false}
							checked={useCustomLeds}
							onChange={(e) => toggleCustomLeds(e)}
						/>
					</Section>
					<Button type="submit">Save</Button>
					{saveMessage ? <span className="alert">{saveMessage}</span> : null}
					<FormContext {...{
						buttonLabels,
						ledButtonMap,
						setDataSources,
						setCustomLeds,
						setUseCustomLeds,
						ledFormat: values.ledFormat
					}} />
					<Modal show={modalVisible} onHide={() => setModalVisible(false)}>
						<Modal.Header closeButton>
							<Modal.Title>Confirm Clear Custom LEDs</Modal.Title>
						</Modal.Header>
						<Modal.Body>Are you sure you would like to clear your current custom LED theme?</Modal.Body>
						<Modal.Footer>
							<Button variant="danger" onClick={() => setModalVisible(false)}>No</Button>
							<Button variant="success" onClick={() => confirmClearAll()}>Yes</Button>
						</Modal.Footer>
					</Modal>
				</Form>
			)}
		</Formik>
	);
}
