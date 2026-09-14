// Dark is the default, including when browser storage is unavailable.
let initialTheme = 'dark';
try {
  const saved = localStorage.getItem('matze-portfolio-theme');
  if (saved === 'dark' || saved === 'light') initialTheme = saved;
} catch { /* Keep the dark default. */ }
document.documentElement.dataset.theme = initialTheme;
document.querySelector('meta[name="theme-color"]').content = initialTheme === 'dark' ? '#191c19' : '#f7f7f2';
