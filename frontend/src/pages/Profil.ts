import { navigate } from '../router';
import { createDeleteAccount } from '../tools/DeleteAccount';
import { createChangePassword } from '../tools/ChangePassword';
import { getUserByToken } from '../tools/APIStorageManager';
export default function Profile(): HTMLElement {

  
  const container = document.createElement('div');
  container.className = 'flex items-center justify-center h-screen bg-gray-300 text-black';
  
  const bg = document.createElement('div');
  bg.className = 'absolute inset-0 bg-[url(/assets/background.png)] bg-cover bg-center blur-sm brightness-75';
  container.appendChild(bg);
  
  const title = document.createElement('h1');
  title.textContent = 'BLACKPONG';
  title.className = `
  fixed top-12 left-1/2 -translate-x-1/2
  text-[5rem] font-extrabold text-green-400
  drop-shadow-[0_0_25px_#535bf2]
  hover:drop-shadow-[0_0_40px_#535bf2]
  hover:scale-105 transition-all duration-300
  cursor-pointer select-none z-20`;
  title.onclick = () => navigate('/'); // Retour à la home
  container.appendChild(title);

  const profileCard = document.createElement('div');
  profileCard.className = 'relative z-10 flex justify-between items-start bg-gray-400/20 p-8 rounded-3xl shadow-2xl w-[900px] h-[450px]';
  
  const statsSection = document.createElement('div');
  statsSection.className = 'flex flex-col items-center gap-8 w-[70%]';
  
  const statsTitle = document.createElement('h2');
  statsTitle.textContent = 'statistiques of player';
  statsTitle.className = 'text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]';
  statsSection.appendChild(statsTitle);
  
  // Conteneur des stats
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid grid-cols-2 gap-4 w-full justify-items-center';
  
  // Helper pour créer une carte de statistique
  const createStatCard = (label: string, value: string): HTMLElement => {
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center justify-center bg-gray-500/20 text-white rounded-3xl w-[250px] h-[70px]';
    const labelEl = document.createElement('p');
    labelEl.textContent = label;
    labelEl.className = 'text-sm';
    const valueEl = document.createElement('p');
    valueEl.textContent = value;
    valueEl.className = 'text-xl font-semibold';
    card.appendChild(labelEl);
    card.appendChild(valueEl);
    return card;
  };
  
  // Valeurs dynamiques
  const ratio = createStatCard('Ratio', '1.28');
  const gamesPlayed = createStatCard('Number of game played', '0');
  const wins = createStatCard('Number of victory', '0');
  const bestStreak = createStatCard('Best win streak', '0');
  const wallet = createStatCard('Wallet', '0');
  const currentStreak = createStatCard('Current win streak', '0');

  // Ajout dans la grille
  [ratio, gamesPlayed, wins, bestStreak, wallet, currentStreak].forEach(c => statsGrid.appendChild(c));
  statsSection.appendChild(statsGrid);

  // Section Profil utilisateur
  const userSection = document.createElement('div');
  userSection.className = 'flex flex-col items-center justify-start bg-gray-500/ rounded-3xl w-[250px] h-[400px] p-6 gap-4 text-white';

  // Avatar
  const avatar = document.createElement('div');
  avatar.className = 'flex items-center justify-center bg-black rounded-full w-[120px] h-[120px]';
  const icon = document.createElement('span');
  icon.textContent = '👤';
  icon.className = 'text-3xl';
  avatar.appendChild(icon);
  userSection.appendChild(avatar);

  // Pseudo et email du player
  const username = document.createElement('h3');
  username.textContent = 'Pseudo';
  username.className = 'text-xl font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]';
  const email = document.createElement('p');
  email.textContent = 'email@example.com';
  email.className = 'text-sm font-bold bg-green-500 rounded-lg w-[200px] hover:bg-green-600 py-2';
  userSection.appendChild(username);
  userSection.appendChild(email);

  // Modifier mot de passe
  const changePass = document.createElement('button');
  changePass.textContent = 'Change the password';
  changePass.className = 'text-sm font-bold text-white bg-purple-400 py-2 rounded-lg  w-[200px] hover:bg-purple-500';
  userSection.appendChild(changePass);
  changePass.onclick = () => {
    const popup = createChangePassword(async (oldPassword, newPassword) => {
      try {
        const response = await fetch('/api/user/password', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword, newPassword }),
        });

        if (!response.ok) throw new Error('Failed to change password');

        console.log('Password updated successfully!');
        navigate('/'); // redirige ou recharge la page
      } catch (err) {
        console.error(err);
        alert('Error changing password.');
      }
    });

    document.body.appendChild(popup);
  };
  // Supprimer le compte
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete account';
  deleteBtn.className = `text-xl font-bold text-white bg-red-500 hover:bg-red-700 py-2
  rounded-lg hover:rounded-full-black w-[200px]
  transition-all duration-600 hover:scale-110`;
  userSection.appendChild(deleteBtn);

  deleteBtn.onclick = () => {
  const popup = createDeleteAccount(async () => {
    try {
      // 👉 Exemple de requête DELETE vers ton backend :
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      console.log('Account deleted successfully!');
      navigate('/'); // Retour à la home
    } catch (err) {
      console.error(err);
      alert('Error deleting account.');
    }
  });

  // Affiche la popup par-dessus tout :
  document.body.appendChild(popup);
  };



  // Ajout des sections principales
  profileCard.appendChild(statsSection);
  profileCard.appendChild(userSection);
  container.appendChild(profileCard);

  getUserByToken().then((response) => {
    if(!response || !response.user)
        console.log("User not found");
    else
      console.log(response.user);
  })

  return container;
}
