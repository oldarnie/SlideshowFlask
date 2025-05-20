let duration = 10; // wird vom Template überschrieben
let images = [];
let legendSentences = [];
let index = 0;
let timer = null;

function shuffle(array) {
    // Fisher-Yates Shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showImage() {
    if (images.length === 0) return;
    const img = document.getElementById("slide-img");
    const data = images[index % images.length];

    // Effekt-Klasse entfernen, um die Animation zu resetten
    img.classList.remove('active');

    setTimeout(() => {
        img.src = "/static/uploads/" + data.filename;
        img.onload = () => {
            img.classList.add('active');
            delayedShowLegendText();
        };
    }, 1000);
}

async function loadLegendSentences() {
    let res = await fetch("/api/legend_texte?" + new Date().getTime());
    legendSentences = await res.json();
}

async function loadImagesAndContinue() {
    let res = await fetch("/api/images?" + new Date().getTime());
    images = await res.json();
    if (images.length > 0) {
        shuffle(images);
        index = 0;
        showImage();
    }
}

async function loadLegendSentences() {
    let res = await fetch("/api/legend_texte?" + new Date().getTime());
    legendSentences = await res.json();
}

function nextImage() {
    if (images.length === 0) return;
    index++;
    if (index >= images.length) {
        Promise.all([
            loadImagesAndContinue(),
            loadLegendSentences()
        ]).then(() => {
            clearInterval(timer);
            timer = setInterval(nextImage, duration * 1000);
        });
    } else {
        showImage();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadLegendSentences().then(() => {
        loadImagesAndContinue().then(() => {
            timer = setInterval(nextImage, duration * 1000);
        });
    });
});

let lastIndex = -1; // Startwert, der außerhalb deines möglichen Indexbereichs liegt

function getRandomSentence() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * legendSentences.length);
    } while (newIndex === lastIndex && legendSentences.length > 1); // Nur wiederholen, wenn mehr als 1 Satz vorhanden ist
    lastIndex = newIndex;
    return legendSentences[newIndex];
}

// Funktion, die den Text nach 3s einblendet und nach 5s wieder ausblendet
function delayedShowLegendText() {
    const textDiv = document.getElementById('legend-text');
    const highlightSpan = textDiv.querySelector('.highlight');
  
    // Zufälligen Satz wählen
    const randomText = getRandomSentence();
    highlightSpan.textContent = randomText;
  
    // Nach 3 Sekunden einblenden
    setTimeout(() => {
      textDiv.classList.remove('hidden');
      textDiv.classList.add('visible');
  
      // Nach weiteren 5 Sekunden wieder ausblenden
      setTimeout(() => {
        textDiv.classList.remove('visible');
        textDiv.classList.add('hidden');
      }, 5000);
  
    }, 3000);
  }




