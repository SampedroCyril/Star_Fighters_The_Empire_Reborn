document.addEventListener('DOMContentLoaded', init);

function init() {
    document.getElementById('button').addEventListener('click', loading);
}

function loading() {

    document.getElementById('transition').classList.remove('invisible');
    document.getElementById('transition').classList.add('visible');
    setTimeout(transitionJs, Math.random() * 5000 + 5000);

}

function transitionJs() {
    location.replace('game/game.html');
}

