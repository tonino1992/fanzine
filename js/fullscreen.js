/**
 * Poche Pretese – fullscreen.js
 * Logica del lettore massimizzato in una pagina dedicata
 */

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const RENDER_SCALE = 2.0;

const params = new URLSearchParams(window.location.search);
const issueId = parseInt(params.get('issue') || '1', 10);
const issue = ISSUES.find(i => i.id === issueId);

if (!issue) {
    window.location.href = 'index.html';
}

document.getElementById('backLink').href = `reader.html?issue=${issueId}`;
document.title = `${issue.titolo} #${issue.numero} - Schermo Intero`;

const loadingOverlay = document.getElementById('loadingOverlay');
const flipbookEl = document.getElementById('flipbook');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const pageCounter = document.getElementById('pageCounter');

let pageFlip = null;
let totalPages = 0;

function getFlipbookSize() {
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    // Su desktop togliamo margine ai lati per le frecce grandi e l'header
    vw -= 180;
    vh -= 80;

    // Su mobile margini strettissimi
    if (window.innerWidth <= 600) {
        vw = window.innerWidth - 40;
        vh = window.innerHeight - 100; // spazio in alto/basso
    }

    if (window.innerWidth <= 600) {
        const w = Math.min(vw, vh / 1.414);
        return { width: Math.round(w), height: Math.round(w * 1.414), isSingle: true };
    }

    const pageW = Math.min(Math.floor(vw / 2), vh / 1.414);
    const pageH = Math.round(pageW * 1.414);
    return { width: Math.round(pageW * 2), height: Math.round(pageH), isSingle: false };
}

function updateCounter() {
    if (!pageFlip) return;
    const cur = pageFlip.getCurrentPageIndex() + 1;
    pageCounter.textContent = `${cur} / ${totalPages}`;
    btnPrev.disabled = cur <= 1;
    btnNext.disabled = cur >= totalPages;
}

async function renderPdfPages(pdfUrl) {
    let pdf;
    try {
        pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    } catch (e) { return null; }

    const pages = [];
    const { width: fbW, height: fbH, isSingle } = getFlipbookSize();
    const pageW = isSingle ? fbW : fbW / 2;
    const pageH = fbH;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        const scale = Math.min((pageW * RENDER_SCALE) / vp.width, (pageH * RENDER_SCALE) / vp.height);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(pageW * RENDER_SCALE);
        canvas.height = Math.round(pageH * RENDER_SCALE);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const offsetX = (canvas.width - viewport.width) / 2;
        const offsetY = (canvas.height - viewport.height) / 2;
        ctx.save();
        ctx.translate(offsetX, offsetY);
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        ctx.restore();

        pages.push(canvas.toDataURL('image/jpeg', 0.92));
    }
    return pages;
}

async function buildFlipbook() {
    const { width: fbW, height: fbH, isSingle } = getFlipbookSize();
    flipbookEl.style.width = fbW + 'px';
    flipbookEl.style.height = fbH + 'px';

    const pages = await renderPdfPages(issue.pdf);
    if (!pages) {
        window.location.href = `reader.html?issue=${issueId}`;
        return;
    }

    totalPages = pages.length;
    flipbookEl.innerHTML = '';
    pages.forEach(dataUrl => {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = `width:100%; height:100%; object-fit:contain; display:block; background:#fff;`;
        flipbookEl.appendChild(img);
    });

    pageFlip = new St.PageFlip(flipbookEl, {
        width: isSingle ? fbW : fbW / 2,
        height: fbH,
        size: 'fixed',
        drawShadow: true,
        flippingTime: 700,
        usePortrait: isSingle,
        startZIndex: 0,
        autoSize: false,
        maxShadowOpacity: 0.4,
        showCover: true,
        mobileScrollSupport: true,
        swipeDistance: 30,
        clickEventForward: true,
    });

    pageFlip.loadFromHTML(flipbookEl.querySelectorAll('img'));
    pageFlip.on('flip', updateCounter);
    pageFlip.on('changeOrientation', updateCounter);

    btnPrev.addEventListener('click', () => pageFlip.flipPrev());
    btnNext.addEventListener('click', () => pageFlip.flipNext());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') pageFlip.flipPrev();
        if (e.key === 'ArrowRight') pageFlip.flipNext();
    });

    updateCounter();
    setTimeout(() => { loadingOverlay.classList.add('hidden'); }, 400);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        loadingOverlay.classList.remove('hidden');
        resizeTimer = setTimeout(() => {
            window.location.reload();
        }, 500);
    });
}

buildFlipbook();
