document.addEventListener("DOMContentLoaded", (e) => {

    const titleBtns = document.querySelectorAll('#ack-button, #about-button, #explain-button');
    const ttlCopy = document.getElementById('titles-copy');

    let timeout = null;
    let glitchInterval = null;

    titleBtns.forEach(btn => {
        btn.addEventListener("mousedown", () => {
            const textToInsert = btn.getAttribute('data-text');
            const glitchType = btn.getAttribute('data-glitch');
            insertTxt(ttlCopy, textToInsert, glitchType);
        });
    });

    function insertTxt(el, strEl, glitchType) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        if (glitchInterval) {
            clearInterval(glitchInterval);
            glitchInterval = null;
        }

        let target = strEl.split("");
        let current = new Array(target.length).fill('\u00A0');
        let intlArr = [...Array(current.length).keys()];
        let midI = findMiddleElements(intlArr);
        let newOrder = intlArr.sort((a, b) => {
            let distA = Math.abs(a - midI);
            let distB = Math.abs(b - midI);
            return distA - distB
        })
        // console.log(newOrder);
        let revealIndex = 0;
        let revealedIndices = new Set();
        let resolvedIndices = new Set();

        let randChars1 = ':)'
        let randChars2 = '[-o-]';
        let randChars3 = '10';

        // Select which character set to use based on glitchType
        let randChars = '';
        if (glitchType === '1') {
            randChars = randChars2;
        } else if (glitchType === '2') {
            randChars = randChars1;
        } else if (glitchType === '3') {
            randChars = randChars3;
        } else {
            randChars = randChars1; // default
        }

        const charArr = randChars.split("");

        // Continuously update unresolved characters with random glitches
        const updateGlitch = () => {
            for (let i = 0; i < current.length; i++) {
                if (!resolvedIndices.has(i) && revealedIndices.has(i)) {
                    let indexR = Math.floor(Math.random() * charArr.length);
                    current[i] = charArr[indexR];
                }
            }
            el.textContent = current.join('');
        }

        // Phase 1: Fill with random glitching characters
        const fillGlitch = () => {

            if (revealIndex >= target.length) {
                timeout = setTimeout(() => {
                    resolve();
                }, 1);
                return;
            }

            let indexR = Math.floor(Math.random() * charArr.length);
            let charR = charArr[indexR];
            // current.push(charR);
            current[newOrder[revealIndex]] = charR;
            revealedIndices.add(newOrder[revealIndex]);
            revealIndex++;
            el.textContent = current.join('');

            timeout = setTimeout(() => {
                fillGlitch();
            }, 1);
        }

        // Phase 2: Replace glitching characters with real ones (randomly)
        const resolve = () => {
            if (resolvedIndices.size >= target.length) {
                clearInterval(glitchInterval);
                glitchInterval = null;
                timeout = null;
                return;
            }

            let unresolvedIndices = [];
            for (let i = 0; i < target.length; i++) {
                if (!resolvedIndices.has(i)) {
                    unresolvedIndices.push(i);
                }
            }

            let randomIndex = unresolvedIndices[Math.floor(Math.random() * unresolvedIndices.length)];

            current[randomIndex] = target[randomIndex];
            resolvedIndices.add(randomIndex);
            el.textContent = current.join('');

            timeout = setTimeout(() => {
                resolve();
            }, 1);
        }

        el.textContent = '';
        glitchInterval = setInterval(updateGlitch, 67);
        fillGlitch();
    }



    const tagBtns = document.querySelectorAll('#specialities-button, #tools-button, #aesthetics-button');
    tagBtns.forEach(btn => {
        btn.addEventListener("mousedown", () => {
            const btnType = btn.getAttribute('data-tag');

            const specDiv = document.getElementById('specialty-tags');
            const toolDiv = document.getElementById('tool-tags');
            const aestDiv = document.getElementById('aesthetic-tags');

            if (btnType === 'spec') {
                specDiv.classList.remove('hidden');
                toolDiv.classList.add('hidden');
                aestDiv.classList.add('hidden');
            } else if (btnType === 'tool') {
                toolDiv.classList.remove('hidden');
                specDiv.classList.add('hidden');
                aestDiv.classList.add('hidden');
            } else if (btnType === 'aest') {
                aestDiv.classList.remove('hidden');
                toolDiv.classList.add('hidden');
                specDiv.classList.add('hidden');
            }
        });
    });
    // Show specialty tags by default on page load
    const specDiv = document.getElementById('specialty-tags');
    if (specDiv) {
        specDiv.classList.remove('hidden');
    }
});

function findMiddleElements(arr) {
    let firstI = 0;
    let lastI = arr.length;

    let midI = Math.floor((firstI + lastI) / 2);
    let result = midI;

    return result;
}