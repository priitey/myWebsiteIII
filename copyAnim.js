document.addEventListener("DOMContentLoaded", (e) => {

    const titleBtns = document.querySelectorAll('#ack-button, #about-button, #explain-button');
    const ttlCopy = document.getElementById('titles-copy');

    let timeout = null;
    let glitchInterval = null;

    titleBtns.forEach(btn => {
        btn.addEventListener("mousedown", () => {
            const textToInsert = btn.getAttribute('data-text');
            const glitchType = btn.getAttribute('data-glitch');
            const orderType = btn.getAttribute('data-order');
            insertTxt(ttlCopy, textToInsert, glitchType, orderType);
        });
    });

    function insertTxt(el, strEl, glitchType, orderType) {
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
        let revealIndex = 0;
        let revealedIndices = new Set();
        let resolvedIndices = new Set();
        let textWidth = 250;
        let midI = findMiddleElements(intlArr);

        // Calculate order based on orderType
        let revealOrder;
        if (orderType === 'spiral') {
            revealOrder = calculateSpiralOrder(intlArr, midI, textWidth, el);
        } else if (orderType === 'center') {
            revealOrder = calculateCenterOrder(intlArr, midI);
        } else if (orderType === 'spots') {
            revealOrder = calculateRandomOrder(intlArr);
        } else if (orderType === 'sequential') {
            revealOrder = calculateSequentialOrder(intlArr);
        } else {
            // Default to center
            revealOrder = calculateCenterOrder(intlArr, midI);
        }

        let randChars1 = ':)';
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
                }, 10);
                return;
            }

            let indexR = Math.floor(Math.random() * charArr.length);
            let charR = charArr[indexR];
            current[revealOrder[revealIndex]] = charR;
            revealedIndices.add(revealOrder[revealIndex]);
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
    return Math.floor(arr.length / 2);
}

function getCoords(index, width, el) {
    if (!getCoords.cachedCharWidth) {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        getCoords.cachedCharWidth = fontSize * 0.48;
    }
    
    const charsPerLn = Math.floor(width / getCoords.cachedCharWidth);
    let x = index % charsPerLn;
    let y = Math.floor(index / charsPerLn);

    return { x, y };
}

function calculateSpiralOrder(intlArr, midI, textWidth, el) {
    let sprMidI = getCoords(midI, textWidth, el);
    let sprCtrX = sprMidI.x;
    let sprCtrY = sprMidI.y;
    
    return [...intlArr].sort((a, b) => {
        let aPos = getCoords(a, textWidth, el);
        let bPos = getCoords(b, textWidth, el);

        let angleA = Math.atan2(aPos.y - sprCtrY, aPos.x - sprCtrX);
        let angleB = Math.atan2(bPos.y - sprCtrY, bPos.x - sprCtrX);
        
        if (angleA < 0) angleA += 2 * Math.PI;
        if (angleB < 0) angleB += 2 * Math.PI;
        
        let radiusA = Math.hypot(aPos.x - sprCtrX, aPos.y - sprCtrY);
        let radiusB = Math.hypot(bPos.x - sprCtrX, bPos.y - sprCtrY);
        
        let sprFactor = -0.7;
        let spiralA = angleA + (radiusA * sprFactor);
        let spiralB = angleB + (radiusB * sprFactor);

        return spiralA - spiralB;
    });
}

function calculateCenterOrder(intlArr, midI) {
    return [...intlArr].sort((a, b) => {
        let distA = Math.abs(a - midI);
        let distB = Math.abs(b - midI);
        return distA - distB;
    });
}

function calculateRandomOrder(intlArr) {
    return [...intlArr].sort(() => Math.random() - 0.5);
}

function calculateSequentialOrder(intlArr) {
    return [...intlArr.reverse()];
}