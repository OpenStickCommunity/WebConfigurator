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

	const [gradientNormalColor1, _setGradientNormalColor1] = useState('#00ffff');
	const setGradientNormalColor1 = (gradientNormalColor1) => {
		localStorage.setItem('gradientNormalColor1', gradientNormalColor1);
		_setGradientNormalColor1(gradientNormalColor1);
	};

	const [gradientNormalColor2, _setGradientNormalColor2] = useState('#ff00ff');
	const setGradientNormalColor2 = (gradientNormalColor2) => {
		localStorage.setItem('gradientNormalColor2', gradientNormalColor2);
		_setGradientNormalColor1(gradientNormalColor2);
	};

	const [gradientPressedColor1, _setGradientPressedColor1] = useState('#ff00ff');
	const setGradientPressedColor1 = (gradientPressedColor1) => {
		localStorage.setItem('gradientPressedColor1', gradientPressedColor1);
		_setGradientPressedColor1(gradientPressedColor1);
	};

	const [gradientPressedColor2, _setGradientPressedColor2] = useState('#00ffff');
	const setGradientPressedColor2 = (gradientPressedColor2) => {
		localStorage.setItem('gradientPressedColor2', gradientPressedColor2);
		_setGradientPressedColor1(gradientPressedColor2);
	};

	return (
		<AppContext.Provider
			{...props}
			value={{
				buttonLabels,
				gradientNormalColor1,
				gradientNormalColor2,
				gradientPressedColor1,
				gradientPressedColor2,
				savedColors,
				setButtonLabels,
				setGradientNormalColor1,
				setGradientNormalColor2,
				setGradientPressedColor1,
				setGradientPressedColor2,
				setSavedColors,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
