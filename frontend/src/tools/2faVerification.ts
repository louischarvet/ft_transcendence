import { navigate } from "../router";
import { checkConnection, verifyTwoFactorCode} from "./APIStorageManager";

export default function TwofaVerification(): HTMLElement {
  checkConnection().then((connected) => {
    if (connected) {
      navigate('/select-game');
    }
  });

  let code: string = '';
  
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col justify-center items-center gap-8 p-16 h-[500px] w-[400px] bg-[#0000000e] rounded-xl backdrop-blur-2xl';

  const title = document.createElement('h2');
  title.textContent = 'Verify 2FA Code';
  title.className = 'text-4xl font-bold text-white';
  wrapper.appendChild(title);

  const input = document.createElement('input');
  input.placeholder = 'Enter your 2FA code';
  input.type = 'text';
  input.className = 'text-black p-2 rounded-md w-[220px]';
  input.oninput = (e: Event) => {
  const target = e.target as HTMLInputElement;
    code = target.value;
  }
  wrapper.appendChild(input);

  const verifyButton = document.createElement('button');
  verifyButton.textContent = 'Verify code';
  verifyButton.className = 'bg-[#646cff] text-white rounded-full h-[35px] w-[90px] hover:bg-[#535bf2] hover:drop-shadow-[0_0_10px_#535bf2]';
  verifyButton.onclick = () => {
  console.log('2FA Verification:', code);

  
		if (!code) {
			console.error('2FA verification failed');
			history.back();
			return;
		}
		verifyTwoFactorCode(code).then( (res) => {
			if (!res){
				console.error('2FA verification failed');
				history.back();
				return;
			}
			else
				navigate('/select-game');
		});
	};
  wrapper.appendChild(verifyButton);

  return wrapper;
}