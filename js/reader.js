/**
 * Poche Pretese – reader.js
 * Logica del lettore flipbook: PDF.js + StPageFlip
 */

/* ─── CONFIG PDF.js ─── */
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const RENDER_SCALE = 2.0; // Risoluzione rendering pagine (2x = alta qualità retina)

/* ─── DOM ELEMENTS ─── */
const loadingOverlay = document.getElementById('loadingOverlay');
const flipbookEl = document.getElementById('flipbook');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const pageCounter = document.getElementById('pageCounter');
const btnDownload = document.getElementById('btnDownload');
const noPdfMsg = document.getElementById('noPdfMsg');
const expectedPath = document.getElementById('expectedPath');
const readerNumero = document.getElementById('readerNumero');
const readerTitolo = document.getElementById('readerTitolo');
const readerSottotitolo = document.getElementById('readerSottotitolo');
const btnFullscreen = document.getElementById('btnFullscreen'); // Fullscreen button
const flipbookStage = document.querySelector('.flipbook-stage'); // Fullscreen target container

/* ─── PARSE URL PARAMS ─── */
const params = new URLSearchParams(window.location.search);
const issueId = parseInt(params.get('issue') || '1', 10);

/* ─── FIND ISSUE DATA ─── */
const issue = ISSUES.find(i => i.id === issueId);

if (!issue) {
    window.location.href = 'index.html';
}

/* ─── FILL HEADER ─── */
readerNumero.textContent = issue.numero;
readerTitolo.textContent = issue.titolo;
readerSottotitolo.textContent = issue.sottotitolo;
document.title = `${issue.titolo} ${issue.numero} – Poce Pretese`;

/* ─── FLIPBOOK STATE ─── */
let pageFlip = null;
let totalPages = 0;
let currentPage = 0;

/* ─── FLIPBOOK SIZE ─── */
function getFlipbookSize() {
    const isFullScreen = document.fullscreenElement !== null;
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    if (isFullScreen) {
        // Usa più spazio disponibile, togliendo margine per ui e tasti base
        vw -= 160;
        vh -= 150;
    } else {
        // Rendi il flipbook più contenuto quando non è a schermo intero
        vw -= 100;
        vh -= 260; // Togliamo più altezza per ridurre l'ingombro generale
    }

    // Portrait A4-ish ratio: 1:1.414
    // Show 2 pages side by side on desktop, 1 page on mobile
    if (vw <= 600) {
        const w = Math.min(vw - 32, 380, vh / 1.414);
        return { width: Math.round(w), height: Math.round(w * 1.414), isSingle: true };
    }

    // desktop
    const pageW = Math.min(Math.floor((vw - 40) / 2), vh / 1.414);
    const pageH = Math.round(pageW * 1.414);
    return { width: Math.round(pageW * 2), height: Math.round(pageH), isSingle: false };
}

/* ─── UPDATE COUNTER ─── */
function updateCounter() {
    if (!pageFlip) return;
    const cur = pageFlip.getCurrentPageIndex() + 1;
    pageCounter.textContent = `${cur} / ${totalPages}`;
    btnPrev.disabled = cur <= 1;
    btnNext.disabled = cur >= totalPages;
}

/* ─── RENDER PDF PAGES TO CANVAS DATA URLS ─── */
async function renderPdfPages(pdfUrl) {
    let pdf;
    try {
        pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    } catch (e) {
        return null; // PDF not found
    }

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

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center page content
        const offsetX = (canvas.width - viewport.width) / 2;
        const offsetY = (canvas.height - viewport.height) / 2;
        ctx.save();
        ctx.translate(offsetX, offsetY);

        await page.render({
            canvasContext: ctx,
            viewport: viewport,
        }).promise;

        ctx.restore();
        pages.push(canvas.toDataURL('image/jpeg', 0.92));
    }

    return pages;
}

/* ─── BUILD FLIPBOOK ─── */
async function buildFlipbook() {
    const { width: fbW, height: fbH, isSingle } = getFlipbookSize();

    // Set fixed dimensions on container
    flipbookEl.style.width = fbW + 'px';
    flipbookEl.style.height = fbH + 'px';

    // Render pages
    const pages = await renderPdfPages(issue.pdf);

    if (!pages) {
        // PDF not found – show friendly error
        loadingOverlay.classList.add('hidden');
        flipbookEl.style.display = 'none';
        document.querySelector('.flipbook-container').style.display = 'none';
        pageCounter.style.display = 'none';
        if (btnFullscreen) btnFullscreen.style.display = 'none'; // Nasondi tasto fullscreen
        document.querySelector('.reader-actions').style.marginTop = '0';
        noPdfMsg.style.display = 'flex';
        expectedPath.textContent = issue.pdf;
        return;
    }

    totalPages = pages.length;

    // Create img elements for page-flip
    flipbookEl.innerHTML = '';
    pages.forEach((dataUrl) => {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = `width:100%; height:100%; object-fit:contain; display:block; background:#fff;`;
        flipbookEl.appendChild(img);
    });

    // Init StPageFlip
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

    // Init controls
    btnPrev.addEventListener('click', () => pageFlip.flipPrev());
    btnNext.addEventListener('click', () => pageFlip.flipNext());

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') pageFlip.flipPrev();
        if (e.key === 'ArrowRight') pageFlip.flipNext();
    });

    // Download link
    btnDownload.href = issue.pdf;
    btnDownload.download = `poce_pretese_${String(issue.id).padStart(2, '0')}.pdf`;

    // Fullscreen link update
    if (btnFullscreen) {
        btnFullscreen.href = `fullscreen.html?issue=${issueId}`;
    }

    updateCounter();

    // Hide loading
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 400);
}

/* ─── INIT ─── */
buildFlipbook();
