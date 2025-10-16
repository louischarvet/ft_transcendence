// ./common_tools/checkNameFormat.js

//! ajout le 17/09/2025
// Vérifie si le format du mail est correct
async function checkEmailFormat(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Vérifie si le format du mot de passe est correct
async function checkPasswordFormat(password) {
	// Vérifie la longueur et le pattern autorisé
	const regex = /^[^<>{}"'`]*$/;

	return (
		typeof password === 'string' &&
		password.length >= 8 &&
		password.length <= 128 &&
		regex.test(password)
	);
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

export { checkNameFormat, checkPasswordFormat, checkPhoneFormat, checkEmailFormat };
