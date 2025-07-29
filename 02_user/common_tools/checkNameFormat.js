// ./common_tools/checkNameFormat.js


// Vérifie si le format du nom est correct
async function checkNameFormat(name) {
	/*  /^[a-zA-Z][a-zA-Z0-9]*$/.test(name)*/
	return /^[A-Z]$/i.test(name[0]) && /^[a-zA-Z0-9]+$/.test(name);
}

export { checkNameFormat };
