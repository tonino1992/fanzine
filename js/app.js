/**
 * Poche Pretese – app.js
 * Logica homepage
 */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('issuesGrid');
  const countEl = document.getElementById('issueCount');
  if (!grid) return;

  const sorted = [...ISSUES].sort((a, b) => b.id - a.id);
  
  if (countEl) {
    countEl.textContent = `[ ${String(ISSUES.length).padStart(2, '0')} ISSUES ]`;
  }

  if (!ISSUES.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-state__title">NO ISSUES YET</h3>
      </div>`;
    return;
  }

  sorted.forEach((issue, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.setProperty('--card-accent', issue.colore || '#FF3300');

    const isNewest = index === 0;
    const hasCover = issue.cover && issue.cover !== '';

    const coverHTML = hasCover
      ? `<img class="card__cover" src="${issue.cover}" alt="Cover ${issue.numero}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
         <div class="card__cover-placeholder" style="display:none;">${minimalPlaceholder(issue)}</div>`
      : `<div class="card__cover-placeholder">${minimalPlaceholder(issue)}</div>`;

    card.innerHTML = `
      <div class="card__cover-wrap">
        ${coverHTML}
        ${isNewest ? '<span class="card__badge">NEW ISSUE!</span>' : ''}
      </div>
      <div class="card__info">
        <div class="card__header">
          <span class="card__issue">ISSUE ${String(issue.id).padStart(2, '0')}</span>
          <span class="card__date">${issue.data}</span>
        </div>
        <h3 class="card__title">${issue.sottotitolo}</h3>
        <p class="card__desc">${issue.descrizione}</p>
        <div class="card__actions">
          <a class="btn btn--solid" href="reader.html?issue=${issue.id}">READ NOW</a>
          <a class="btn btn--outline" href="${issue.pdf}" download>PDF</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
});

function minimalPlaceholder(issue) {
  const num = String(issue.id).padStart(2, '0');
  
  // High contrast vibrant colors for placeholders
  const colors = ['#FF3300', '#CCFF00', '#0033FF', '#FF00FF', '#00FFCC'];
  const bg = issue.colore || colors[(issue.id - 1) % colors.length];
  const fg = '#0A0A0A';

  return `
    <svg width="100%" height="100%" viewBox="0 0 300 400"
         xmlns="http://www.w3.org/2000/svg"
         style="position:absolute;inset:0;display:block;">
      <rect width="300" height="400" fill="${bg}"/>
      <!-- Grid pattern overlay -->
      <pattern id="grid${issue.id}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${fg}" stroke-width="1" stroke-opacity="0.2"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid${issue.id})"/>
      <text
        x="150" y="200"
        font-family="'Oswald', sans-serif"
        font-size="200"
        font-weight="700"
        fill="${fg}"
        text-anchor="middle"
        dominant-baseline="middle"
        letter-spacing="-10">${num}</text>
      <text
        x="150" y="320"
        font-family="'Space Grotesk', sans-serif"
        font-size="24"
        font-weight="700"
        fill="${fg}"
        text-anchor="middle"
        letter-spacing="8">ISSUE</text>
    </svg>`;
}
