import { getFriendsList, addNewFriend } from "./APIStorageManager";
import { Logout } from "./APIStorageManager";
import { checkConnection } from './APIStorageManager';

export default function DropDownMenu() {
	checkConnection().then((connected) => {
		console.log("checkConnection : ", connected);
		if (!connected) return;
	});

	const wrapper = document.createElement('div');
	wrapper.className = 'absolute top-5 right-0';

	// BUTTON PRINCIPAL
	const dropDownButton = document.createElement('button');
	dropDownButton.className = 'inline-flex justify-center w-40 gap-x-1.5 rounded-l-2xl bg-[#00FF668f] px-3 py-2 text-2xl font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-[#00FF66bf] hover:drop-shadow-[0_0_10px_#646cff]';
	dropDownButton.textContent = 'Player';
	wrapper.appendChild(dropDownButton);

	// MENU DROPDOWN
	const dropdownMenu = document.createElement('div');
	dropdownMenu.className = 'hidden absolute right-0 mt-0.3 w-40 origin-top-right divide-y divide-white/10 rounded-l-xl bg-[#646cff8f] outline-1 -outline-offset-1 outline-white/10 transition transition-discrete';
	wrapper.appendChild(dropdownMenu);

	const menuClassName = 'block px-4 py-2 text-xl text-gray-300 hover:bg-white/5 hover:text-white hover:drop-shadow-[0_0_10px_#535bf2]';

	// SECTION PROFIL ET AMIS
	const menuSection1 = document.createElement('div');
	menuSection1.className = 'py-1';

	const profileLink = document.createElement('a');
	profileLink.href = '/profil';
	profileLink.className = menuClassName;
	profileLink.textContent = 'Profil';
	menuSection1.appendChild(profileLink);

	const friendButton = document.createElement('a');
	friendButton.className = menuClassName;
	friendButton.textContent = 'Friends';
	menuSection1.appendChild(friendButton);

	const dropDownFriendList = document.createElement('div');
	dropDownFriendList.className = 'hidden absolute top-0 right-40 mt-0.3 w-[220px] max-h-60 overflow-y-auto divide-y divide-white/10 rounded-xl bg-[#646cff8f] outline-1 -outline-offset-1 outline-white/10 transition transition-discrete';
	friendButton.appendChild(dropDownFriendList);

	const friendsList: { name: string; status: string; picture?: string }[] = [];

	const friendsListContainer = document.createElement('div');
	friendsListContainer.className = 'py-1 flex flex-col';
	dropDownFriendList.appendChild(friendsListContainer);

	// FONCTION CRÉATION D'UN AMI
	function createFriendItem(friend: { name: string; status: string; picture?: string }) {
		const friendItem = document.createElement('div');
		friendItem.className = 'flex items-center gap-2 px-2 py-1';

		// Photo
		const friendPic = document.createElement('img');
		friendPic.src = friend.picture || './pictures/avatar_1.jpg';
		friendPic.className = 'w-8 h-8 rounded-full object-cover';
		friendItem.appendChild(friendPic);

		// Nom
		const friendName = document.createElement('span');
		friendName.className = 'text-lg text-gray-200';
		friendName.textContent = friend.name;
		friendItem.appendChild(friendName);

		// Statut
		const statusDot = document.createElement('span');
		statusDot.className = friend.status === 'available' ? 'text-green-500' : 'text-red-500';
		statusDot.textContent = '●';
		friendItem.appendChild(statusDot);
		//const statusDot = document.createElement('span');
		//statusDot.className = `w-3 h-3 rounded-full ${friend.status === 'online' ? 'bg-green-400' : 'bg-red-500'}`;
		//friendItem.appendChild(statusDot);

		friendsListContainer.appendChild(friendItem);
	}

	// Récupération depuis le backend
	getFriendsList().then((value) => {
		if (!value) {
			console.log("Pas d'amis trouvés");
			return;
		}
		console.log("getFriendsList -> ", value);
		value.friends.forEach((friend) => {
			friendsList.push(friend);
			createFriendItem(friend);
		});
	});

	// Ajouter un ami
	const addFriendInput = document.createElement('input');
	addFriendInput.type = 'text';
	addFriendInput.placeholder = 'Add a friend...';
	addFriendInput.className = 'block px-2 py-1 w-[150px] text-xl text-gray-300 bg-transparent rounded-lg';

	const addFriendButton = document.createElement('button');
	addFriendButton.className = menuClassName + ' w-[50px] text-center';
	addFriendButton.textContent = '+';

	const addFriendContainer = document.createElement('div');
	addFriendContainer.className = 'flex justify-start gap-1 px-2 py-1';
	addFriendContainer.appendChild(addFriendInput);
	addFriendContainer.appendChild(addFriendButton);
	dropDownFriendList.prepend(addFriendContainer);

	async function addFriend() {
		const friendName = addFriendInput.value.trim();
		if (!friendName) return;

		try {
			const response = await addNewFriend(friendName);
			if (!response) return;
			if (!response.ok) {
				alert("Impossible d’ajouter cet ami (nom incorrect ou déjà ami).");
				return;
			}
			const newFriend = { name: friendName, status: 'offline', picture: './pictures/BG.webp' };
			friendsList.push(newFriend);
			createFriendItem(newFriend);
			addFriendInput.value = '';
		} catch (err) {
			alert("Erreur lors de l’ajout de l’ami.");
			console.error(err);
		}
	}

	addFriendInput.onkeydown = (e) => { if (e.key === 'Enter') addFriend(); };
	addFriendButton.onclick = addFriend;

	// SHOW/HIDE MENU
	const showFriendList = () => dropDownFriendList.classList.remove('hidden');
	const hideFriendList = () => dropDownFriendList.classList.add('hidden');

	friendButton.onmouseenter = showFriendList;
	dropDownFriendList.onmouseenter = showFriendList;
	friendButton.onmouseleave = hideFriendList;
	dropDownFriendList.onmouseleave = hideFriendList;

	dropdownMenu.appendChild(menuSection1);

	// LOGOUT
	const menuSection2 = document.createElement('div');
	menuSection2.className = 'py-1';
	const logoutLink = document.createElement('a');
	logoutLink.href = '#';
	logoutLink.className = menuClassName + ' hover:drop-shadow-[0_0_30px_#00FF00]';
	logoutLink.textContent = 'Logout';

	logoutLink.onclick = async (e) => {
		e.preventDefault();
		const response = await Logout();
		if (response?.ok) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			window.location.href = "/";
		} else alert("Erreur lors de la déconnexion");
	};
	menuSection2.appendChild(logoutLink);
	dropdownMenu.appendChild(menuSection2);

	dropDownButton.onmouseenter = () => dropdownMenu.classList.remove('hidden');
	dropDownButton.onclick = () => dropdownMenu.classList.toggle('hidden');
	dropdownMenu.onmouseleave = () => dropdownMenu.classList.add('hidden');

	document.addEventListener('click', (event) => {
		if (!wrapper.contains(event.target as Node)) {
			dropdownMenu.classList.add('hidden');
			dropDownFriendList.classList.add('hidden');
		}
	});

	return wrapper;
}
