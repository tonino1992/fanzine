/**
 * Poche Pretese – Archivio Numeri
 * Aggiungi qui ogni nuovo numero della fanzine.
 * Il campo `pdf` deve puntare a un file nella cartella /pdfs/
 * Il campo `cover` deve puntare a un'immagine nella cartella /covers/
 */

const ISSUES = [
    {
        id: 1,
        numero: "#1",
        titolo: "Poche Pretese",
        sottotitolo: "Il primo numero!",
        data: "Febbraio 2026",
        mese: "02",
        anno: "2026",
        descrizione: "Il numero zero. L'inizio di tutto. Una fanzine nata dalla voglia di raccontare storie, disegnare mondi e condividere idee senza troppe pretese — ma con un sacco di passione.",
        cover: "covers/cover_01.jpg",
        pdf: "pdfs/fanzine_01.pdf",
        pagine: 12,
        colore: "#FF3B5C"
    },
    {
        id: 2,
        numero: "#2",
        titolo: "Poche Pretese",
        sottotitolo: "Primavera in disordine",
        data: "Marzo 2026",
        mese: "03",
        anno: "2026",
        descrizione: "Fumetti, illustrazioni e storie brevi per salutare la primavera nel modo più caotico possibile. Polvere, pollini e pensieri fuori stagione.",
        cover: "covers/cover_02.jpg",
        pdf: "pdfs/fanzine_02.pdf",
        pagine: 16,
        colore: "#FFB800"
    },
    {
        id: 3,
        numero: "#3",
        titolo: "Poche Pretese",
        sottotitolo: "Notti Urbane",
        data: "Aprile 2026",
        mese: "04",
        anno: "2026",
        descrizione: "Tra graffiti, lampioni spenti e nottate troppo lunghe: il numero urban di Poche Pretese esplora la città quando dorme (o quasi).",
        cover: "covers/cover_03.jpg",
        pdf: "pdfs/fanzine_03.pdf",
        pagine: 14,
        colore: "#00C2FF"
    }
];
