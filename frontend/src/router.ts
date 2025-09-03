type Route = {
  path: string;
  render: () => HTMLElement;
};

const routes: Route[] = [];

export function defineRoutes(r: Route[]) {
  routes.push(...r);
}

export function navigate(path: string) {

	history.pushState({}, '', path);
	renderRoute();
}

export function renderRoute() {
  const path = window.location.pathname;
  const match = routes.find(r => r.path === path);
  const app = document.getElementById('app');
  if (!app) throw new Error("Element with id 'app' not found");
  app.innerHTML = '';
  if (match) {
    app.appendChild(match.render());
  } else {
    const el = document.createElement('h1');
    el.textContent = '404 - Not Found';
    app.appendChild(el);
  }
}

window.addEventListener('popstate', renderRoute);
