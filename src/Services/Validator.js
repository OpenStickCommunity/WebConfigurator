import * as yup from 'yup';

yup.addMethod(yup.string, 'validateColor', function(this: yup.StringSchema, name) {
	console.log('validateColor');
	return this.test('', 'Valid hex color required', (value) => value?.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i));
});

yup.addMethod(yup.NumberSchema, 'validateSelectionWhenEnabled', function(this: yup.NumberSchema, name, choices) {
	console.log('validateSelectionWhenEnabled');
	return this.when(name, {
		is: value => !!value,
		then: () => this.required().oneOf(choices.map(o => o.value)),
		otherwise: () => yup.mixed().notRequired()
	})
});

yup.addMethod(yup.NumberSchema, 'validateNumberWhenEnabled', function(this: yup.NumberSchema, name) {
	return this.when(name, {
		is: value => !!value,
		then: () => this.required(),
		otherwise: () => yup.mixed().notRequired().strip()
	})
});

yup.addMethod(yup.NumberSchema, 'validateRangeWhenEnabled', function(this: yup.NumberSchema, name, min, max) {
	return this.when(name, {
		is: value =>!!value,
		then: () => this.required().min(min).max(max),
		otherwise: () => yup.mixed().notRequired().strip()
	});
});

yup.addMethod(yup.NumberSchema, 'validatePinWhenEnabled', function(this: yup.NumberSchema, name, usedPins) {
	console.log('validating ' + name, usedPins, this);
	return this.checkUsedPins(usedPins).validateRangeWhenEnabled(name, -1, 29);
});

yup.addMethod(yup.NumberSchema, 'checkUsedPins', function(this: yup.NumberSchema, usedPins) {
	return this.test('', '${originalValue} is unavailable/already assigned!', (value) => usedPins.indexOf(value) === -1);
});

export default yup;
