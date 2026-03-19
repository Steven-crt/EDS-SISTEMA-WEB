let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

const obraColors = [
    'linear-gradient(70deg, #f0b429, #ff6b00)',
    'linear-gradient(70deg, #ff6b00, #ff0000)',
    'linear-gradient(70deg, #ff0000, #8b0000)',
    'linear-gradient(70deg, #8b0000, #4b0082)',
];

function updateBackground() {
    const items = document.querySelectorAll('.carousel .list .item');
    let visibleItem = null;
    for (let i = 0; i < items.length; i++) {
        if (items[i].style.zIndex === '10' || window.getComputedStyle(items[i]).zIndex === '10') {
            visibleItem = items[i];
            break;
        }
    }
    if (!visibleItem) {
        visibleItem = items[1];
    }
    const colorIndex = visibleItem.getAttribute('data-color');
    if (colorIndex !== null) {
        document.documentElement.style.setProperty('--carousel-gradient', obraColors[colorIndex]);
    }
}

nextButton.onclick = function(){
    showSlider('next');
}
prevButton.onclick = function(){
    showSlider('prev');
}
let unAcceppClick;
const showSlider = (type) => {
    if (carousel.classList.contains('showDetail')) {
        return;
    }
    
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';

    updateBackground();
    
    carousel.classList.remove('next', 'prev');
    let items = document.querySelectorAll('.carousel .list .item');
    if(type === 'next'){
        listHTML.appendChild(items[0]);
        carousel.classList.add('next');
    }else{
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add('prev');
    }
    
    clearTimeout(unAcceppClick);
    unAcceppClick = setTimeout(()=>{
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 1500)
}
seeMoreButtons.forEach((button) => {
    button.onclick = function(){
        const items = document.querySelectorAll('.carousel .list .item');
        let activeItemIndex = 1;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].style.zIndex === '10' || window.getComputedStyle(items[i]).zIndex === '10') {
                activeItemIndex = i;
                break;
            }
        }
        
        items.forEach(item => item.classList.remove('active'));
        items[activeItemIndex].classList.add('active');
        
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');
    }
});
backButton.onclick = function(){
    carousel.classList.remove('showDetail');
    const items = document.querySelectorAll('.carousel .list .item');
    items.forEach(item => item.classList.remove('active'));
}

updateBackground();

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateBackground();
    }
});
