import './style.css';

const path = location.pathname.replace(/\/+$/, '') || '/';

const header = document.createElement('header');
header.className = 'app-header';
header.innerHTML = `
  <div class="brand"><span class="brand-icon" aria-hidden="true">◇</span> Character Studio</div>
  <nav class="app-nav" aria-label="Character tools">
    <a class="control" href="/">Studio</a>
    <a class="control" href="/anatomy">Anatomy</a>
  </nav>`;
for (const link of header.querySelectorAll('a')) {
  if (link.pathname === path) link.setAttribute('aria-current', 'page');
}
document.body.append(header);

if (path === '/anatomy') {
  void import('./anatomy/page');
} else if (path === '/') {
  void import('./studio/page');
} else {
  document.title = 'Character Studio';
  document.body.insertAdjacentHTML('beforeend', '<main class="not-found"><h1>Page not found</h1><a href="/">Open Character Studio</a></main>');
}
