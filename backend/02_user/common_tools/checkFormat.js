// ./common_tools/checkNameFormat.js

//! ajout le 17/09/2025
// Vérifie si le format du mail est correct
async function checkEmailFormat(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//! ajout le 17/09/2025
// Vérifie si le format du téléphone est correct
async function checkPhoneFormat(phone) {
	return /^[0-9]{10}$/.test(phone);
}

// Vérifie si le format du nom est correct
async function checkNameFormat(name) {
	/*  /^[a-zA-Z][a-zA-Z0-9]*$/.test(name)*/
	return /^[A-Z]$/i.test(name[0]) && /^[a-zA-Z0-9]+$/.test(name);
}

export { checkNameFormat, checkPhoneFormat, checkEmailFormat };
