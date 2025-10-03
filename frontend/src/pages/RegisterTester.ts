import { postJson } from '../utils/authFetch';

export default function RegisterTester(): HTMLElement {
	const container = document.createElement('div');
	container.className = 'flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900 text-white p-8';

	// Titre
	const title = document.createElement('h1');
	title.textContent = 'Register Tester';
	title.className = 'text-3xl font-bold';
	container.appendChild(title);

	// Inputs pour le register
	const nameInput = document.createElement('input');
	nameInput.placeholder = 'Name';
	nameInput.className = 'p-2 rounded w-72 text-black';
	container.appendChild(nameInput);

	const emailInput = document.createElement('input');
	emailInput.placeholder = 'Email';
	emailInput.type = 'email';
	emailInput.className = 'p-2 rounded w-72 text-black';
	container.appendChild(emailInput);

	const passwordInput = document.createElement('input');
	passwordInput.placeholder = 'Password';
	passwordInput.type = 'password';
	passwordInput.className = 'p-2 rounded w-72 text-black';
	container.appendChild(passwordInput);

	// Bouton Register
	const btn = document.createElement('button');
	btn.textContent = 'Register';
	btn.className = 'mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded';
	container.appendChild(btn);

	// Zone de réponse
	const responseBox = document.createElement('pre');
	responseBox.className = 'bg-gray-700 p-2 rounded w-96 h-48 overflow-auto text-sm mt-4';
	responseBox.textContent = 'Response will appear here...';
	container.appendChild(responseBox);

	// Input pour code 2FA
	const codeInput = document.createElement('input');
	codeInput.placeholder = 'Enter verification code';
	codeInput.className = 'p-2 rounded w-72 text-black mt-2';
	codeInput.style.display = 'none';
	container.appendChild(codeInput);

	const verifyBtn = document.createElement('button');
	verifyBtn.textContent = 'Verify Code';
	verifyBtn.className = 'mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded';
	verifyBtn.style.display = 'none';
	container.appendChild(verifyBtn);

	// Objet pour stocker les infos de l'utilisateur enregistré
	let registeredUser: { id: number; type: string; name: string; email: string } | null = null;

	// Bouton Register click
	btn.onclick = async () => {
		try {
			const name = nameInput.value.trim();
			const email = emailInput.value.trim();
			const password = passwordInput.value.trim();

			if (!name || !email || !password) {
				responseBox.textContent = 'Name, email and password are required!';
				return;
			}

			const body = { name, email, password };
			const res = await postJson('/api/user/register', body);

			if (!res.user) {
				responseBox.textContent = JSON.stringify(res, null, 2);
				return;
			}

			// Stocker les infos de l'utilisateur
			registeredUser = {
				id: res.user.id,
				type: res.user.type,
				name: res.user.name,
				email: res.user.email
			};

			// Afficher le champ pour code 2FA
			codeInput.style.display = 'block';
			verifyBtn.style.display = 'block';
			btn.disabled = true;
			responseBox.textContent = `User created! Check your email (${email}) for verification code.`;
		} catch (err: any) {
			responseBox.textContent = JSON.stringify(err, null, 2);
		}
	};

	// Bouton Verify Code click
	verifyBtn.onclick = async () => {
		try {
			if (!registeredUser) {
				responseBox.textContent = 'No registered user found!';
				return;
			}

			const code = codeInput.value.trim();
			if (!code) {
				responseBox.textContent = 'Please enter the verification code!';
				return;
			}

			const body2fa = {
				id: registeredUser.id,
				email: registeredUser.email,
				type: registeredUser.type,
				name: registeredUser.name,
				code
			};

			const res2fa = await postJson('/api/twofa/verifycode', body2fa);

			if (res2fa.success) {
				responseBox.textContent = 'Account verified! You can now log in.';
				codeInput.style.display = 'none';
				verifyBtn.style.display = 'none';
			} else {
				responseBox.textContent = JSON.stringify(res2fa, null, 2);
			}
		} catch (err: any) {
			responseBox.textContent = JSON.stringify(err, null, 2);
		}
	};

	return container;
}
