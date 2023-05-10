import React, { createContext, useState } from 'react';

export const AppContext = createContext(null);

export const AppContextProvider = ({ children, ...props }) => {
	const [buttonLabels, _setButtonLabels] = useState(localStorage.getItem('buttonLabels') || 'gp2040');
	const setButtonLabels = (buttonLabels) => {
		localStorage.setItem('buttonLabels', buttonLabels);
		_setButtonLabels(buttonLabels);
	};

	const [savedColors, _setSavedColors] = useState(localStorage.getItem('savedColors') ? localStorage.getItem('savedColors').split(',') : []);
	const setSavedColors = (savedColors) => {
		localStorage.setItem('savedColors', savedColors);
		_setSavedColors(savedColors);
	};

	return (
		<AppContext.Provider
			{...props}
			value={{
				buttonLabels,
				savedColors,
				setButtonLabels,
				setSavedColors,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
