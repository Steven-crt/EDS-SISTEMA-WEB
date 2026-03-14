/* =============================================
   EMPRESA.JS — Animaciones e interactividad
   ============================================= */

// --- Contador animado de estadísticas ---
function animateCounter(el, target, duration) {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            start = target;
            clearInterval(timer);
        }
        el.textContent = start;
    }, 16);
}

// Lanza los contadores cuando la sección entra en pantalla
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.s-num').forEach(el => {
                const target = parseInt(el.dataset.target, 10);
                animateCounter(el, target, 1500);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });

const statsTape = document.querySelector('.stats-tape');
if (statsTape) statsObserver.observe(statsTape);


// --- Smooth scroll al hacer clic en "Conócenos ↓" ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


// --- Fade-in por scroll para las tarjetas de servicios ---
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.service-card').forEach(card => {
    card.style.animationPlayState = 'paused';
    cardObserver.observe(card);
});
