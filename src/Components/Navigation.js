import React, { useContext, useState } from 'react';
import { Nav, NavDropdown, Navbar, Button, Modal } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import { AppContext } from '../Contexts/AppContext';
import FormSelect from './FormSelect';
import { saveButtonLabels } from '../Services/Storage';
import BUTTONS from '../Data/Buttons.json';
import './Navigation.scss';
import WebApi from '../Services/WebApi';

const Navigation = (props) => {
	const { buttonLabels, setButtonLabels } = useContext(AppContext);

	const [show, setShow] = useState(false);
	const [isRebooting, setIsRebooting] = useState(null); // null because we want the button to assume untouched state

	const handleClose = () => setShow(false);
	const handleShow = () => { setIsRebooting(null); setShow(true); }
	const handleReboot = async () => {
		if (isRebooting == false) { setShow(false); return; }
		setIsRebooting(true);
		await WebApi.reboot();
		setIsRebooting(false);
	};

	const updateButtonLabels = (e) => {
		saveButtonLabels(e.target.value);
		setButtonLabels(e.target.value);
	};

	return (
		<Navbar collapseOnSelect bg="dark" variant="dark" expand="md" fixed="top">
			<Navbar.Brand href="/">
				<img src="images/logo.png" className="title-logo" alt="logo" />{' '}GP2040
			</Navbar.Brand>
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="me-auto">
					<Nav.Link as={NavLink} exact={true} to="/">Home</Nav.Link>
					<Nav.Link as={NavLink} exact={true} to="/settings">Settings</Nav.Link>
					<NavDropdown title="Configuration">
						<NavDropdown.Item as={NavLink} exact={true} to="/pin-mapping">Pin Mapping</NavDropdown.Item>
						<NavDropdown.Item as={NavLink} exact={true} to="/led-config">LED Configuration</NavDropdown.Item>
						<NavDropdown.Item as={NavLink} exact={true} to="/display-config">Display Configuration</NavDropdown.Item>
						<NavDropdown.Item as={NavLink} exact={true} to="/add-ons">Add-Ons Configuration</NavDropdown.Item>
						<NavDropdown.Item as={NavLink} exact={true} to="/backup">Data Backup and Restoration</NavDropdown.Item>
					</NavDropdown>
					<NavDropdown title="Links">
						<NavDropdown.Item as={NavLink} to={{ pathname: "https://gp2040-ce.info/" }} target="_blank">Documentation</NavDropdown.Item>
						<NavDropdown.Item as={NavLink} to={{ pathname: "https://github.com/OpenStickCommunity/GP2040-CE" }} target="_blank">Github</NavDropdown.Item>
					</NavDropdown>
					<NavDropdown title="DANGER ZONE" className="btn-danger danger-zone">
						<NavDropdown.Item as={NavLink} exact={true} to="/reset-settings">Reset Settings</NavDropdown.Item>
					</NavDropdown>
				</Nav>
				<Nav>
					<Button style={{ marginRight: "7px" }} variant="success" onClick={handleShow}>
						Reboot
					</Button>
					<div style={{ marginTop: "4px" }}>
						<FormSelect
							name="buttonLabels"
							className="form-select-sm"
							value={buttonLabels}
							onChange={updateButtonLabels}
						>
							{Object.keys(BUTTONS).map((b, i) =>
								<option key={`button-label-option-${i}`} value={BUTTONS[b].value}>{BUTTONS[b].label}</option>
							)}
						</FormSelect>
						<Navbar.Toggle aria-controls="basic-navbar-nav" />
					</div>
				</Nav>
			</Navbar.Collapse>

			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Reboot controller?</Modal.Title>
				</Modal.Header>
				<Modal.Body>{ isRebooting == false ? "Done rebooting, this browser tab can now be closed."
								: "Reboot to regular controller mode to play?" }</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						No
					</Button>
					<Button variant="primary" onClick={handleReboot}>
						{ isRebooting == null ? "Yes" : (isRebooting ? "Rebooting" : "Done!") }
					</Button>
				</Modal.Footer>
			</Modal>
		</Navbar>
	);
};

export default Navigation;
