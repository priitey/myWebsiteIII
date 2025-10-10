document.addEventListener("DOMContentLoaded", (e) => {
    console.log("DOM fully loaded and parsed");

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
        let current = [];
        let resolvedIndices = new Set();

        let randChars1 = '▒▓░';
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
                if (!resolvedIndices.has(i)) {
                    let indexR = Math.floor(Math.random() * charArr.length);
                    current[i] = charArr[indexR];
                }
            }
            el.textContent = current.join('');
        }

        // Phase 1: Fill with random glitching characters
        const fillGlitch = () => {
            if (current.length >= target.length) {
                timeout = setTimeout(() => {
                    resolve();
                }, 1);
                return;
            }

            let indexR = Math.floor(Math.random() * charArr.length);
            let charR = charArr[indexR];
            current.push(charR);
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
        glitchInterval = setInterval(updateGlitch, 50);
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
});