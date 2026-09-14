const target = document.getElementById('archive-target');
if (target) {
  const destination = new URL(target.getAttribute('href'), window.location.href);
  destination.search = window.location.search;
  destination.hash = window.location.hash;
  window.location.replace(destination.href);
}
