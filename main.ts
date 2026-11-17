const path = location.pathname.replace(/\/+$/, '') || '/';

if (path === '/anatomy') {
  void import('./anatomy/page');
} else if (path === '/') {
  void import('./studio/page');
} else {
  document.title = 'Character Studio';
  document.body.style.cssText = 'margin:0;padding:48px;font:16px Arial,sans-serif;color:#263b36;background:#f7f8f5';
  document.body.innerHTML = '<h1>Page not found</h1><a href="/">Open Character Studio</a>';
}
