import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppContext } from './Contexts/AppContext';
import Navigation from './Components/Navigation'

import HomePage from './Pages/HomePage'
import PinMappingPage from "./Pages/PinMapping";
import ResetSettingsPage from './Pages/ResetSettingsPage';
import SettingsPage from './Pages/SettingsPage';
import DisplayConfigPage from './Pages/DisplayConfig';
import LEDConfigPage from './Pages/LEDConfigPage';
import AddonsConfigPage from './Pages/AddonsConfigPage';
import BackupPage from './Pages/BackupPage';
import PlaygroundPage from './Pages/PlaygroundPage';

import { loadButtonLabels } from './Services/Storage';
import './App.scss';

const App = () => {
	const [buttonLabels, setButtonLabels] = useState(loadButtonLabels() ?? 'gp2040');

	const appData = {
		buttonLabels,
		setButtonLabels,
	};

	return (
		<AppContext.Provider value={appData}>
			<Router>
				<Navigation />
				<div className="container-fluid body-content">
					<Routes>
						<Route exact path="/" element={<HomePage />} />
						<Route path="/settings" element={<SettingsPage />} />
						<Route path="/pin-mapping" element={<PinMappingPage />} />
						<Route path="/reset-settings" element={<ResetSettingsPage />} />
						<Route path="/led-config" element={<LEDConfigPage />} />
						<Route path="/display-config" element={<DisplayConfigPage />} />
						<Route path="/add-ons" element={<AddonsConfigPage />} />
						<Route path="/backup" element={<BackupPage />} />
						<Route path="/playground" element={<PlaygroundPage />} />
					</Routes>
				</div>
			</Router>
		</AppContext.Provider>
	);
}

export default App;
