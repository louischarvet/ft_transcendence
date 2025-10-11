// --- Type route ---
export type Route = {
	path: string; // ex: "/profil" ou "/profil/:id"
	render: (params?: { [key: string]: string }) => Promise<HTMLElement> | HTMLElement;
};

const routes: Route[] = [];

// --- Définir les routes ---
export function defineRoutes(r: Route[]) {
	routes.push(...r);
}

// --- Navigate ---
export function navigate(path: string) {
	history.pushState({}, '', path);
	renderRoute();
}

// --- Render Route ---
export async function renderRoute() {
	const path = window.location.pathname;
	let matchedRoute: Route | undefined;
	let params: { [key: string]: string } = {};

	for (const route of routes) {
		const keys: string[] = [];
		const pattern = route.path.replace(/:(\w+)/g, (_, key) => {
			keys.push(key);
			return '([^/]+)';
		});
		const regex = new RegExp(`^${pattern}$`);
		const match = path.match(regex);
		if (match) {
			matchedRoute = route;
			keys.forEach((k, i) => {
				params[k] = match[i + 1];
			});
			break;
		}
	}

	const app = document.getElementById('app');
	if (!app) throw new Error("Element with id 'app' not found");
	app.innerHTML = '';

	if (matchedRoute) {
		const element = await matchedRoute.render(params); // <-- await ici
		app.appendChild(element);
	} else {
		const notFoundWrapper = document.createElement('div');
		notFoundWrapper.className = 'flex justify-center items-center h-screen';
		const notFound = document.createElement('h1');
		notFound.className = 'text-4xl font-bold text-red-500';
		notFound.textContent = '404 - Not Found';
		notFoundWrapper.appendChild(notFound);
		app.appendChild(notFoundWrapper);
	}
}

window.addEventListener('popstate', renderRoute);
