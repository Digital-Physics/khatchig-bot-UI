// hamburger menu
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', toggleMenu);
menuToggle.addEventListener('touchstart', toggleMenu);
document.addEventListener('click', closeMenu);
document.addEventListener('touchstart', closeMenu);

function toggleMenu(e) {
  e.stopPropagation();
  menu.classList.toggle('show');
}

function closeMenu(e) {
  const target = e.target;
  if (!menu.contains(target) && !menuToggle.contains(target)) {
    menu.classList.remove('show');
  }
}

// rest of code

