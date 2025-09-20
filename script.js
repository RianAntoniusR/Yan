// splash -> show app after animation
const splash = document.getElementById('splash');
const app = document.getElementById('app');

setTimeout(() => {
    splash.style.transition = "opacity 420ms ease";
    splash.style.opacity = 0;
    setTimeout(() => { splash.remove(); }, 420);
    app.classList.add('show');
}, 2900);

// year
document.getElementById('year').textContent = new Date().getFullYear();

// skip animation with Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (splash) {
            splash.remove();
            app.classList.add('show');
        }
    }
});
