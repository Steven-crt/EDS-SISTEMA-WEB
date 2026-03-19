// ===== MENÚ HAMBURGUESA RESPONSIVE =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburgerBtn');
    const nav = document.querySelector('header nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            const isOpen = hamburger.classList.toggle('active');
            nav.classList.toggle('open', isOpen);
            document.body.classList.toggle('nav-open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Cerrar menú al hacer clic en un enlace
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                document.body.classList.remove('nav-open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                document.body.classList.remove('nav-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                document.body.classList.remove('nav-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }
});
