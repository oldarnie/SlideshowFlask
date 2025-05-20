let duration = 5; // wird vom Template überschrieben
let images = [];
let index = 0;
let timer = null;

const legendSentences = [
    "The Man, The Myth, The Legend!",
    "Harry, bleib so wie Du bist!",
    "Happy Birthday Harry!!!",
    "Volle Kanne Hoschis!"
  ];

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
    void img.offsetWidth;
    img.src = "/static/uploads/" + data.filename;
}

function showImage() {
    if (images.length === 0) return;
    const img = document.getElementById("slide-img");
    const data = images[index % images.length];

    // Effekt-Klasse entfernen, um die Animation zu resetten
    img.classList.remove('active');

    // Jetzt das Bild wechseln und kurz warten, bevor 'active' wieder gesetzt wird
    setTimeout(() => {
        img.src = "/static/uploads/" + data.filename;

        // Wenn das Bild bereits geladen ist, kann die Animation zu schnell ablaufen.
        // Mit 'onload' sicherstellen, dass das Bild angezeigt wird, nachdem es geladen ist.
        img.onload = () => {
            img.classList.add('active');

            delayedShowLegendText();

        };
    }, 50); // 50ms reichen meistens, bei Bedarf erhöhen
}


async function loadImagesAndContinue(nextStep) {
    let res = await fetch("/api/images");
    images = await res.json();
    if (images.length > 0) {
        shuffle(images);
        index = 0;
        showImage();
        if (typeof nextStep === "function") nextStep();
    }
}

function nextImage() {
    if (images.length === 0) return;
    index++;
    if (index >= images.length) {
        // Am Ende: Neu laden (inkl. Shuffle & Status)
        loadImagesAndContinue(() => {
            // Nach neuem Laden weiterwechseln (d.h. erstes Bild des neuen Satzes)
            clearInterval(timer);
            timer = setInterval(nextImage, duration * 1000);
        });
    } else {
        showImage();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.SLIDESHOW_DURATION) duration = window.SLIDESHOW_DURATION;
    loadImagesAndContinue(() => {
        timer = setInterval(nextImage, duration * 1000);
    });
});


// Funktion, die den Text nach 3s einblendet und nach 5s wieder ausblendet
function delayedShowLegendText() {
    const textDiv = document.getElementById('legend-text');
    const highlightSpan = textDiv.querySelector('.highlight');
  
    // Zufälligen Satz wählen
    const randomText = legendSentences[Math.floor(Math.random() * legendSentences.length)];
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

/*
function showLegendText() {
    const text = document.getElementById('legend-text');
    text.classList.add('visible');
    text.classList.remove('hidden');
    // Optional: Nach 4 Sekunden wieder ausblenden
    setTimeout(() => {
      text.classList.remove('visible');
      text.classList.add('hidden');
    }, 5000);
  }
*/


