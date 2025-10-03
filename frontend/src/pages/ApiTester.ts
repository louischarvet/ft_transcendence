import { authFetch } from '../utils/authFetch';

export default function ApiTester(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'p-8 flex flex-col gap-6 text-white min-h-screen bg-gray-900';

  const title = document.createElement('h1');
  title.textContent = 'API Tester';
  title.className = 'text-4xl font-bold mb-6';
  container.appendChild(title);

  // Liste des routes à tester
  const routes = [
    '/user/',
    //'/user/tester',
    '/user/guest',
    '/user/register',
    '/user/login',
    '/user/logout',
    '/user/delete',
    '/user/addfriend/friend1',
    '/user/find/test/status',
    '/user/tournament',
    '/user/changestatus',
    '/user/updatestats',
  ];

  routes.forEach((route) => {
    const card = document.createElement('div');
    card.className = 'bg-gray-800 p-4 rounded-lg flex flex-col gap-2';

    const routeTitle = document.createElement('p');
    routeTitle.textContent = route;
    routeTitle.className = 'font-semibold';
    card.appendChild(routeTitle);

    // Sélecteur de méthode HTTP
    const methodSelect = document.createElement('select');
    ['GET', 'POST', 'PUT', 'DELETE'].forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      methodSelect.appendChild(opt);
    });
    card.appendChild(methodSelect);

    // Input pour le body JSON
    const bodyInput = document.createElement('textarea');
    bodyInput.placeholder = 'Body JSON (pour POST/PUT/DELETE)';
    bodyInput.className = 'bg-gray-900 p-2 rounded text-sm w-full h-24';
    card.appendChild(bodyInput);

    // Zone de réponse
    const responseBox = document.createElement('pre');
    responseBox.className = 'bg-gray-700 p-2 rounded text-sm overflow-x-auto';
    responseBox.textContent = 'Response will appear here...';
    card.appendChild(responseBox);

    // Bouton pour envoyer la requête
    const btn = document.createElement('button');
    btn.textContent = 'Send Request';
    btn.className = 'bg-blue-600 hover:bg-blue-500 rounded px-3 py-1 text-white mt-2';
    btn.onclick = async () => {
      try {
        const body = bodyInput.value ? JSON.parse(bodyInput.value) : undefined;
        const res = await authFetch(`/api${route}`, {
          method: methodSelect.value,
          body,
        });
        responseBox.textContent = JSON.stringify(res, null, 2);
      } catch (err: any) {
        responseBox.textContent = JSON.stringify(err, null, 2);
      }
    };
    card.appendChild(btn);

    container.appendChild(card);
  });

  return container;
}
