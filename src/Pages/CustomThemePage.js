import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FormCheck from 'react-bootstrap/FormCheck';
import Modal from 'react-bootstrap/Modal';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import Row from 'react-bootstrap/Row';
import Stack from 'react-bootstrap/Stack';
import { SketchPicker } from '@hello-pangea/color-picker';

import { AppContext } from '../Contexts/AppContext';
import FormSelect from '../Components/FormSelect';
import Section from '../Components/Section';
import WebApi from '../Services/WebApi';
import { BUTTONS, MAIN_BUTTONS, AUX_BUTTONS } from '../Data/Buttons';
import LEDColors from '../Data/LEDColors';

import './CustomThemePage.scss';

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

const defaultCustomTheme = Object.keys(BUTTONS.gp2040)
	?.filter(p => p !== 'label' && p !== 'value')
	.reduce((a, p) => {
		a[p] = { normal: '#000000', pressed: '#000000' };
		return a;
	}, {});

defaultCustomTheme['ALL'] = { normal: '#000000', pressed: '#000000' };

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

const CustomThemePage = () => {
	const { buttonLabels } = useContext(AppContext);
	const [saveMessage, setSaveMessage] = useState('');
	const [ledLayout, setLedLayout] = useState(0);
	const [pickerType, setPickerType] = useState(null);
	const [selectedButton, setSelectedButton] = useState('');
	const [selectedColor, setSelectedColor] = useState('#000000');
	const [hasCustomTheme, setHasCustomTheme] = useState(false);
	const [customTheme, setCustomTheme] = useState({ ...defaultCustomTheme });
	const [ledOverlayTarget, setLedOverlayTarget] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);

	const confirmClearAll = () => {
		setLedOverlayTarget(null);
		setSelectedButton(null);
		setSelectedColor(null);

		// Reset all custom LEDs
		Object.keys(customTheme).forEach((b, i) => {
			Object.keys(customTheme[b]).forEach((s, i) => {
				customTheme[b][s] = '#000000';
			});
		});
		setCustomTheme(customTheme);
		setModalVisible(false);
	};

	const handleLedColorClick = (pickerType) => {
		setSelectedColor(customTheme[selectedButton][pickerType]);
		setPickerType({ type: pickerType, button: selectedButton });
	};

	const handleLedColorChange = (c) => {
		if (selectedButton) {
			if (selectedButton === 'ALL')
				Object.keys(customTheme).forEach(p => customTheme[p][pickerType.type] = c.hex);
			else
			customTheme[selectedButton][pickerType.type] = c.hex;
		}

		setCustomTheme(customTheme);
		setSelectedColor(c);
	};

	const toggleCustomTheme = (e) => {
		setHasCustomTheme(e.target.checked);
	};

	const toggleSelectedButton = (e, buttonName) => {
		e.stopPropagation();
		if (selectedButton === buttonName) {
			setSelectedButton(null);
			setLedOverlayTarget(null);
		}
		else {
			setLedOverlayTarget(e.target);
			setSelectedButton(buttonName);
			setSelectedColor(buttonName === 'ALL' ? '#000000' : customTheme[buttonName].normal);
			setPickerType({ type: 'normal', button: buttonName });
		}
	};

	const submit = async () => {
		const leds = { ...customTheme };
		delete leds['ALL'];
		const success = await WebApi.setCustomTheme({ hasCustomTheme, customTheme: leds });
		setSaveMessage(success ? 'Saved! Please Restart Your Device' : 'Unable to Save');
	};

	useEffect(() => {
		async function fetchData() {
			const data = await WebApi.getCustomTheme();

			setHasCustomTheme(data.hasCustomTheme);
			if (!data.customTheme['ALL'])
				data.customTheme['ALL'] = { normal: '#000000', pressed: '#000000' };
			setCustomTheme(data.customTheme);
		}

		fetchData();

		// Hide color picker when anywhere but picker is clicked
		window.addEventListener('click', (e) => {
			toggleSelectedButton(e, selectedButton);
		});
	}, []);

	return <>
		<Section title="Custom LED Theme">
			<div>
				<p>
					Here you can enable and configure a custom LED theme.
					The custom theme will be selectable using the Next and Previous Animation shortcuts on your controller.
				</p>
				{hasCustomTheme &&
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
									label="Preview Layout"
									name="ledLayout"
									value={ledLayout}
									onChange={(e) => setLedLayout(e.target.value)}
									style={{ width: 150 }}
								>
									{BUTTON_LAYOUTS.map((o, i) => <option key={`ledLayout-option-${i}`} value={o.value}>{o.label}</option>)}
								</FormSelect>
							</div>
							<div className="d-flex led-preview-container">
								<div
									className={`led-preview led-preview-${BUTTON_LAYOUTS[ledLayout]?.stickLayout}`}
									onContextMenu={(e) => e.preventDefault()}
								>
									<div className="container-aux">
										{AUX_BUTTONS.map(buttonName => (
											<LEDButton
												key={`led-button-${buttonName}`}
												className={`${buttonName} ${selectedButton === buttonName ? 'selected' : ''}`}
												name={BUTTONS[buttonLabels][buttonName]}
												buttonColor={customTheme[buttonName]?.normal}
												buttonPressedColor={customTheme[buttonName]?.pressed}
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
												buttonColor={customTheme[buttonName]?.normal}
												buttonPressedColor={customTheme[buttonName]?.pressed}
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
					placement="bottom"
					container={this}
					containerPadding={20}
					transition={null}
				>
					<Popover onClick={(e) => e.stopPropagation()}>
						<Container className="led-color-picker">
							<h5 className="text-center">{selectedButton === 'ALL' ? selectedButton : BUTTONS[buttonLabels][selectedButton]}</h5>
							<Form.Group as={Row}
								className={`led-color-option ${pickerType?.type === 'normal' ? 'selected' : ''}`}
								onClick={() => handleLedColorClick('normal')}
							>
								<Form.Label column sm={8} className="p-3">Normal</Form.Label>
								<Col sm={2}>
									<div
										className={`led-color led-color-normal`}
										style={{ backgroundColor: customTheme[selectedButton]?.normal }}
									></div>
								</Col>
							</Form.Group>
							<Form.Group as={Row}
								className={`led-color-option ${pickerType?.type === 'pressed' ? 'selected' : ''}`}
								onClick={() => handleLedColorClick('pressed')}
							>
								<Form.Label column sm={8} className="p-3">Pressed</Form.Label>
								<Col sm={2}>
									<div
										className={`led-color led-color-pressed`}
										style={{ backgroundColor: customTheme[selectedButton]?.pressed }}
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
				id="hasCustomTheme"
				reverse="true"
				error={undefined}
				isInvalid={false}
				checked={hasCustomTheme}
				onChange={(e) => toggleCustomTheme(e)}
			/>
		</Section>
		<div>
			<Button onClick={submit}>Save</Button>
			{saveMessage ? <span className="alert">{saveMessage}</span> : null}
		</div>
		<Modal show={modalVisible} onHide={() => setModalVisible(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Confirm Clear Custom Theme</Modal.Title>
			</Modal.Header>
			<Modal.Body>Are you sure you would like to clear your current custom LED theme?</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={() => setModalVisible(false)}>No</Button>
				<Button variant="success" onClick={() => confirmClearAll()}>Yes</Button>
			</Modal.Footer>
		</Modal>
	</>;
};

export default CustomThemePage;
