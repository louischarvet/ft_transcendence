import { navigate } from '../router';
import { postJson } from '../utils/authFetch';

export default function Register(): HTMLElement {
	const container = document.createElement('div');
  	container.className = 'flex flex-col items-center h-screen bg-[url(/assets/background.png)] bg-cover bg-center';

	// Conteneur Register
	const registerWrapper = document.createElement('div');
	const title = document.createElement('h1');
	title.textContent = 'Register';
	registerWrapper.className = 'flex flex-col justify-center items-center gap-6 p-10 h-[520px] w-[420px] bg-[#0000000e] rounded-xl backdrop-blur-2xl';

	// Titre
	const registerTitle = document.createElement('h2');
	registerTitle.textContent = 'Create your account';
	registerTitle.className = 'text-3xl font-bold text-white';
	registerWrapper.appendChild(registerTitle);

	const createInput = (placeholder: string, type: string, id?: string): HTMLInputElement => {
    	const input = document.createElement('input');
    	if (id) input.id = id;
    	input.placeholder = placeholder;
    	input.type = type;
    	input.className = 'text-black p-2 rounded-md w-[260px]';
    	return input;
  	};

	const nickInput = createInput('Enter your nickname', 'text', 'reg-nickname');
	const passInput = createInput('Enter your password (min 8 chars)', 'password', 'reg-password');
	const passConfirmInput = createInput('Confirm your password', 'password', 'reg-password-confirm');

	registerWrapper.appendChild(nickInput);
	registerWrapper.appendChild(passInput);
	registerWrapper.appendChild(passConfirmInput);

	const msg = document.createElement('div');
	msg.className = 'text-sm text-red-400 h-5';
	registerWrapper.appendChild(msg);

	const buttons = document.createElement('div');
	buttons.className = 'flex justify-center w-full gap-10';

	const submitBtn = document.createElement('button');
	submitBtn.textContent = 'Register';
	submitBtn.className = 'bg-[#646cff] text-white rounded-full h-[35px] w-[120px] hover:bg-[#535bf2] hover:drop-shadow-[0_0_10px_#535bf2]';
	submitBtn.onclick = async () => {
		msg.textContent = '';
		const name = nickInput.value.trim();
		const password = passInput.value;
		const confirm = passConfirmInput.value;
		if (!name || !password) {
			msg.textContent = 'Veuillez remplir tous les champs.';
			return;
		}
		if (password.length < 8) {
			msg.textContent = 'Le mot de passe doit contenir au moins 8 caractères.';
			return;
		}
		if (password !== confirm) {
			msg.textContent = 'Les mots de passe ne correspondent pas.';
			return;
		}
		try {
			const res = await postJson('/api/user/signin', { name, password });
			msg.className = 'text-sm text-green-400 h-5';
			msg.textContent = 'Compte créé !';
			setTimeout(() => navigate('/'), 600);
		} catch (e: any) {
			msg.className = 'text-sm text-red-400 h-5';
			const body = e?.body;
			msg.textContent = (typeof body === 'string') ? body : (body?.error ?? 'Erreur lors de la création.');
		}
	};

	const backBtn = document.createElement('button');
	backBtn.textContent = 'Retour';
	backBtn.className = 'bg-[#222] text-white rounded-full h-[35px] w-[120px] hover:bg-[#333]';
	backBtn.onclick = () => navigate('/');

	buttons.appendChild(submitBtn);
	buttons.appendChild(backBtn);
	registerWrapper.appendChild(buttons);

	container.appendChild(title);
	container.appendChild(registerWrapper);

	return container;
};