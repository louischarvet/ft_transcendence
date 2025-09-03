import { navigate } from '../router';

export default function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center h-screen bg-[url(/assets/background.png)] bg-cover bg-center';

  // Titre
  const title = document.createElement('h1');
  title.textContent = 'BlackPong';
  title.className = 'text-[12rem] font-extrabold text-green-400 drop-shadow-[0_0_30px_#535bf2]';
  container.appendChild(title);

  // Conteneur du login
  const loginWrapper = document.createElement('div');
  loginWrapper.className = 'flex flex-col justify-center items-center gap-8 p-16 h-[500px] w-[400px] bg-[#0000000e] rounded-xl backdrop-blur-2xl';

  const loginTitle = document.createElement('h2');
  loginTitle.textContent = 'Login';
  loginTitle.className = 'text-4xl font-bold text-white';
  loginWrapper.appendChild(loginTitle);

  const createInput = (placeholder: string, type: string, id?: string): HTMLInputElement => {
    const input = document.createElement('input');
    if (id) input.id = id;
    input.placeholder = placeholder;
    input.type = type;
    input.className = 'text-black p-2 rounded-md w-[220px]';
    return input;
  };

  const nickWrapper = document.createElement('div');
  nickWrapper.className = 'flex flex-col gap-2';
  nickWrapper.appendChild(createInput('Enter your nickname', 'text', 'reg-nickname'));
  const loginRememberMe = document.createElement('label');
  loginRememberMe.className = 'flex items-center gap-2 text-sm text-white';
  const loginRememberMeCheckbox = document.createElement('input');
  loginRememberMeCheckbox.type = 'checkbox';
  loginRememberMeCheckbox.className = 'accent-[#646cff]';
  loginRememberMe.appendChild(loginRememberMeCheckbox);
  loginRememberMe.appendChild(document.createTextNode('Remember me'));
  nickWrapper.appendChild(loginRememberMe);
  loginWrapper.appendChild(nickWrapper);

  const passWrapper = document.createElement('div');
  passWrapper.className = 'flex flex-col gap-2';
  passWrapper.appendChild(createInput('Enter your password', 'password', 'reg-password'));
  const loginForgotPassword = document.createElement('a');
  loginForgotPassword.textContent = 'Forgot your password?';
  loginForgotPassword.className = 'text-sm text-white underline';
  loginForgotPassword.href = '#'; // Placeholder for actual forgot password logic
  passWrapper.appendChild(loginForgotPassword);
  loginWrapper.appendChild(passWrapper);

  const loginRegisterWrapper = document.createElement('div');
  loginRegisterWrapper.className = 'flex justify-center w-full gap-10';

  const createLoginRegisterButton = (text: string, onClick: () => void): HTMLButtonElement => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'bg-[#646cff] text-white rounded-full h-[35px] w-[90px] hover:bg-[#535bf2] hover:drop-shadow-[0_0_10px_#535bf2]';
    button.onclick = onClick;
    return button;
  };

  loginRegisterWrapper.appendChild(createLoginRegisterButton('Login', () => navigate('/')));

  //bouton pour s'inscrire	
  loginRegisterWrapper.appendChild(createLoginRegisterButton('Register', () => navigate('/register')));

  loginWrapper.appendChild(loginRegisterWrapper);

  // Conteneur du register
  const registerWrapper = document.createElement('div');
  registerWrapper.className = 'flex flex-col justify-center items-center gap-8 p-16 h-[500px] w-[400px] bg-[#0000000e] rounded-xl backdrop-blur-2xl';

  const registerTitle = document.createElement('h2');
  registerTitle.textContent = 'Register';
  registerTitle.className = 'text-4xl font-bold text-white';
  registerWrapper.appendChild(registerTitle);

  registerWrapper.appendChild(createInput('Enter your nickname', 'text'));
  registerWrapper.appendChild(createInput('Enter your password', 'password'));
  registerWrapper.appendChild(createInput('Confirm your password', 'password'));

  const registerLoginWrapper = document.createElement('div');
  registerLoginWrapper.className = 'flex justify-center w-full gap-10';

  registerLoginWrapper.appendChild(createLoginRegisterButton('Register', () => navigate('/')));
  registerLoginWrapper.appendChild(createLoginRegisterButton('Login ->', () => navigate('/')));

  registerWrapper.appendChild(registerLoginWrapper);

  // Conteneur Login or Register in other way (Google, Intra-42)
  const createOAuth = (): HTMLElement => {
    const oauthWrapper = document.createElement('div');
    oauthWrapper.className = 'flex flex-col gap-1';

    const oauthTitle = document.createElement('h3');
    oauthTitle.textContent = 'Or Login/Register with';
    oauthTitle.className = 'text-sm text-white';
    oauthWrapper.appendChild(oauthTitle);

    const googleLoginButton = document.createElement('button');
    googleLoginButton.textContent = 'Google';
    googleLoginButton.className = 'bg-white text-black rounded-md h-[30px] w-[250px]';
    googleLoginButton.onclick = () => navigate('/'); // Placeholder for actual Google login logic
    oauthWrapper.appendChild(googleLoginButton);

    const intra42LoginButton = document.createElement('button');
    intra42LoginButton.textContent = 'Intra-42';
    intra42LoginButton.className = 'bg-white text-black rounded-md h-[30px] w-[250px]';
    intra42LoginButton.onclick = () => navigate('/'); // Placeholder for actual Intra-42 login logic
    oauthWrapper.appendChild(intra42LoginButton);

    return oauthWrapper;
  };

  loginWrapper.appendChild(createOAuth());
  registerWrapper.appendChild(createOAuth());

  const regMsg = document.createElement('div');
  regMsg.id = 'reg-msg';
  regMsg.className = 'text-sm text-red-400 mt-2';
  loginWrapper.appendChild(regMsg);

  // Conteneur des boutons de jeu
  const buttonsWrapper = document.createElement('div');
  buttonsWrapper.className = 'flex flex-wrap justify-center gap-8 p-16';

  const createGameButton = (label: string, route: string): HTMLElement => {
    const button = document.createElement('button');
    button.className = 'flex items-center justify-center w-[620px] h-[420px] bg-[#646cff50] rounded-xl backdrop-blur-2xl \
      hover:w-[430px] hover:h-[430px] hover:bg-[#535bf2] hover:drop-shadow-[0_0_10px_#535bf2] transition-all duration-300';

    const p = document.createElement('p');
    p.textContent = label;
    p.className = 'text-white text-5xl font-bold';
    button.appendChild(p);

    button.onclick = () => navigate(route);
    return button;
  };

  buttonsWrapper.appendChild(createGameButton('Pong', '/pong3d'));
  buttonsWrapper.appendChild(createGameButton('Blackjack', '/blackjack'));

  // If login is successful
  const loggedIn = !true;
  if (!loggedIn) {
    //container.appendChild(loginWrapper);
     container.appendChild(registerWrapper);
  }
  else
    container.appendChild(buttonsWrapper);

  return container;
}