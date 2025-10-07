import { navigate } from "../router";
import { checkConnection, register } from "./APIStorageManager";

export default function Register(): HTMLElement {
  checkConnection().then((connected) => {
    if (connected) {
      navigate('/select-game');
    }
  });

  const form: { [name: string]: string} = {};

  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col justify-center items-center gap-8 p-16 w-[30%] h-[60%] bg-[#0000000e] rounded-xl backdrop-blur-2xl';

  const title = document.createElement('h2');
  title.textContent = 'Register';
  title.className = 'text-4xl font-bold text-white';
  wrapper.appendChild(title);

  const createInput = (placeholder: string, key: string, type?: string): HTMLInputElement => {
    const input = document.createElement('input');
    input.placeholder = placeholder;
    input.type = type ? type : key;
    input.className = 'text-black p-2 rounded-md w-[70%] h-[10%] w-max-[200px] text-xl';
    input.oninput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      form[key] = target.value;
    }
    return input;
  };

  wrapper.appendChild(createInput('Enter your nickname', 'name', 'text'));
  wrapper.appendChild(createInput('Enter your email', 'email'));
  wrapper.appendChild(createInput('Enter your password', 'password'));
  wrapper.appendChild(createInput('Confirm your password', 'confirmPassword', 'password'));

  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.className = 'flex justify-center w-full h-[10%] gap-10';

  const registerButton = document.createElement('button');
  registerButton.textContent = 'Register';
  registerButton.className = 'bg-[#646cff] text-xl text-white rounded-full w-[50%] h-[100%] hover:bg-[#535bf2] hover:drop-shadow-[0_0_10px_#535bf2]';
  registerButton.onclick = () => {
    console.log('Register Form:', form);

    if (!form.name || !form.email || !form.password || !form.confirmPassword
        || form.password !== form.confirmPassword)
        return;

    if (!register(form.name, form.email, form.password)) {
      console.error('User creation failed');
      return;
    }
    navigate('/2fa-verification');
  };
  buttonsWrapper.appendChild(registerButton);

  const loginButton = document.createElement('button');
  loginButton.textContent = 'Or Login';
  loginButton.className = 'bg-[#646cff] text-xl text-white rounded-full w-[50%] h-[100%] hover:bg-[#535bf2] hover:drop-shadow-[0_0_10px_#535bf2]';
  loginButton.onclick = () => {
    console.log('Login Form:', form);
    navigate('/login');
  };
  buttonsWrapper.appendChild(loginButton);

  wrapper.appendChild(buttonsWrapper);

  return wrapper;
}