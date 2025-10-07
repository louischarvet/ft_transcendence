import { getFriendsList } from "./APIStorageManager";
import { Logout } from "./APIStorageManager";

export default function DropDownMenu() {
	const wrapper = document.createElement('div');
	wrapper.className = 'absolute top-5 right-0';

	const dropDownButton = document.createElement('button');
	dropDownButton.className = 'inline-flex justify-center w-40 gap-x-1.5 rounded-l-2xl bg-[#00FF668f] px-3 py-2 text-2xl font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-[#00FF66bf] hover:drop-shadow-[0_0_10px_#646cff]';
	dropDownButton.textContent = 'Player';
	wrapper.appendChild(dropDownButton);

	const dropdownMenu = document.createElement('div');
	dropdownMenu.className = 'hidden absolute right-0 mt-0.3 w-40 origin-top-right divide-y divide-white/10 rounded-l-xl bg-[#646cff8f] outline-1 -outline-offset-1 outline-white/10 transition transition-discrete';
	wrapper.appendChild(dropdownMenu);

	const menuClassName = 'block px-4 py-2 text-xl text-gray-300 hover:bg-white/5 hover:text-white hover:drop-shadow-[0_0_10px_#535bf2]';

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
	dropDownFriendList.className = 'hidden absolute top-0 right-40 mt-0.3 w-[200px] origin-top-right divide-y divide-white/10 rounded-xl bg-[#646cff8f] outline-1 -outline-offset-1 outline-white/10 transition transition-discrete';
	friendButton.appendChild(dropDownFriendList);

	const friendList : { name : string , status : string } [] = [];

	getFriendsList().then((value) => {
		if (!value) {
			console.log("Pas d'amis trouvés");
			return;
		}

		value.friends.forEach((friend: { name: string; status: string }) => {
			console.log(friend.name);
		});
	});

	// friendList.push(...)
	// const friendList = [{name: 'Nathan', status: 'online'}, {'name': 'Louis', status: 'online'}, {'name': 'Baptiste', status: 'online'}]; // Example friend list
	// const friendList = [{name: 'Nathan', status: 'online'}, {'name': 'Louis', status: 'online'}, {'name': 'Baptiste', status: 'online'}]; // Example friend list

	let removeFriend: boolean = false;

	function createFriendItem(friend: {name: string, status: string}) {
		const friendItem = document.createElement('div');
		friendItem.className = 'flex justify-start items-center';
		const friendLink = document.createElement('a');
		friendLink.className = 'block px-2 py-1 w-[200px] text-2xl text-gray-300 bg-transparent rounded-lg';
		friendLink.href = '#';
		friendLink.textContent = friend.name;
		friendItem.appendChild(friendLink);

		const statusFriend = document.createElement('label');
		statusFriend.className = menuClassName + ' w-[50px] text-center px-5' + (friend.status === 'online' ? ' text-green-400' : ' text-gray-600');
		statusFriend.textContent = '●';
		friendItem.appendChild(statusFriend);

		const removeFriendButton = document.createElement('button');
		removeFriendButton.className = menuClassName + ' hidden w-[50px] text-center';
		removeFriendButton.textContent = 'x';
		friendItem.appendChild(removeFriendButton);

		const friendStats = document.createElement('div');
		friendStats.className = 'hidden absolute right-[200px] mt-0.3 w-[200px] h-40 origin-top divide-white/10 rounded-xl bg-[#646cff8f] outline-1 -outline-offset-1 outline-white/10 transition transition-discrete';
		friendLink.appendChild(friendStats);

		const friendStatsContent = document.createElement('div');
		friendStatsContent.className = 'p-2 text-gray-300';
		friendStatsContent.innerHTML = `<p class="text-lg font-bold mb-1">${friend.name}'s Stats</p>`;
		friendStats.appendChild(friendStatsContent);

		friendLink.onmouseenter = () => { // show remove button
			statusFriend.classList.remove('hidden');
			removeFriendButton.classList.add('hidden');

			friendStats.classList.remove('hidden');
		}

		friendLink.onmouseleave = () => {
			friendStats.classList.add('hidden');
		}

		statusFriend.onmouseenter = () => { // show remove button
			statusFriend.classList.add('hidden');
			removeFriendButton.classList.remove('hidden');
		};

		removeFriendButton.onmouseleave = () => { // hide remove button
			removeFriendButton.classList.add('hidden');
			statusFriend.classList.remove('hidden');
		};

		removeFriendButton.onclick = () => {
			friendList.splice(friendList.indexOf(friend), 1);
			friendItem.remove();

			removeFriend = true;
		};

		friendsListSections2.appendChild(friendItem);
	}

	const friendsListSections1 = document.createElement('div');
	friendsListSections1.className = 'flex justify-start';

	const addFriendInput = document.createElement('input');
	addFriendInput.type = 'text';
	addFriendInput.placeholder = 'Add a friend...';
	addFriendInput.className = 'block px-2 py-1 w-[150px] text-xl text-gray-300 bg-transparent rounded-lg';
	friendsListSections1.appendChild(addFriendInput);

	const addFriendButton = document.createElement('button');
	addFriendButton.className = menuClassName + ' w-[50px] text-center';
	addFriendButton.textContent = '+';
	friendsListSections1.appendChild(addFriendButton);

	function addFriend() {
		const friendName = addFriendInput.value.trim();
		if (friendName) {
			// Add friend logic here
			addFriendInput.value = '';

			const newFriend = {name: friendName, status: 'offline'};
			friendList.push(newFriend);

			createFriendItem(newFriend);
		}
	};

	// add friend when user presses Enter
	addFriendInput.onkeydown = (e) => {
		if (e.key === 'Enter') {
			addFriend();
		}
	};
	addFriendButton.onclick = addFriend;

	dropDownFriendList.appendChild(friendsListSections1);

	const friendsListSections2 = document.createElement('div');
	friendsListSections2.className = 'py-1 max-h-60 justify-start overflow-y-auto';

	friendList.forEach((friend) => {
		createFriendItem(friend);
	});

	dropDownFriendList.appendChild(friendsListSections2);

	const showFriendList = () => { // show friendList
		if (dropDownFriendList.classList.contains('hidden')) {
			dropDownFriendList.classList.remove('hidden');
		}
	};

	const hideFriendList = () => { // hide friendList
		if (!dropDownFriendList.classList.contains('hidden')) {
			dropDownFriendList.classList.add('hidden');
		}
	};

	friendButton.onmouseenter = showFriendList;

	dropDownFriendList.onmouseenter = showFriendList;

	friendButton.onclick = showFriendList;

	friendButton.onmouseleave = hideFriendList;

	dropDownFriendList.onmouseleave = hideFriendList;

	dropdownMenu.appendChild(menuSection1);

	const menuSection2 = document.createElement('div');
	menuSection2.className = 'py-1';
	const logoutLink = document.createElement('a');
	logoutLink.href = '#';
	logoutLink.className = menuClassName + ' hover:drop-shadow-[0_0_30px_#00FF00]';
	logoutLink.textContent = 'Logout';

	logoutLink.onclick = async (e) => {
		e.preventDefault(); // empêche le lien de recharger la page
		try {
			const response = await Logout();
			if (response === null)
				return ;
			console.log("Logout response:", response.status);

			if (response.ok) {
				// Supprime le token localement
				localStorage.removeItem("token");
				//! Supprimer les infos user
				localStorage.removeItem("user");

				// Redirige vers la page de login (ou accueil)
				window.location.href = "/";
			} else {
				console.error("Logout failed:", response.status);
				alert("Erreur lors de la déconnexion");
			}
		} catch (err) {
			console.error("Logout error:", err);
			alert("Une erreur est survenue lors du logout");
		}
	};


	menuSection2.appendChild(logoutLink);
	dropdownMenu.appendChild(menuSection2);

	dropDownButton.onmouseenter = () => { // show menu
		if (dropdownMenu.classList.contains('hidden')) {
			dropdownMenu.classList.remove('hidden');
		}
	};

	dropDownButton.onclick = () => { // toggle menu
		if (dropdownMenu.classList.contains('hidden')) {
			dropdownMenu.classList.remove('hidden');
		} else {
			dropdownMenu.classList.add('hidden');
		}
	};

	dropdownMenu.onmouseleave = () => { // hide menu
		if (!dropdownMenu.classList.contains('hidden')) {
			dropdownMenu.classList.add('hidden');
		}
	};

	document.addEventListener('click', (event) => { // hide menu on click outside
		if (!wrapper.contains(event.target as Node) && removeFriend === false) {
			dropdownMenu.classList.add('hidden');
			dropDownFriendList.classList.add('hidden');
		}
	});

	return wrapper;
}