/**
 * Complete and Accurate Mushaf Page Mapping for all 604 Pages
 * Based on King Fahd Complex Mushaf Madani (Standard Uthmanic Script - Hafs Narration)
 * 
 * This file will be loaded dynamically from the verified JSON file.
 * Each page contains the exact ayahs as they appear in traditional printed mushaf copies.
 * 
 * Data source: AlQuran Cloud API (api.alquran.cloud)
 * Verified: October 10, 2025
 */

let mushafPages = null;

// Load the verified mushaf pages data
async function loadMushafPages() {
    if (mushafPages) {
        return mushafPages;
    }
    
    try {
        const response = await fetch('complete-mushaf-pages-verified.json');
        const data = await response.json();
        mushafPages = data.pages;
        return mushafPages;
    } catch (error) {
        return null;
    }
}


// Helper function to get page number for a specific verse
async function getPageForVerse(surahNumber, verseNumber) {
    const pages = await loadMushafPages();
    if (!pages) return null;
    
    for (let page = 1; page <= 604; page++) {
        const pageInfo = pages[page];
        if (!pageInfo) continue;
        
        // Handle single surah pages
        if (!pageInfo.multiSurah) {
            if (surahNumber === pageInfo.surah) {
                if (verseNumber >= pageInfo.startAyah && verseNumber <= pageInfo.endAyah) {
                    return page;
                }
            }
        } else {
            // Handle multi-surah pages
            for (const surahData of pageInfo.surahs) {
                if (surahNumber === surahData.surah) {
                    if (verseNumber >= surahData.startAyah && verseNumber <= surahData.endAyah) {
                        return page;
                    }
                }
            }
        }
    }
    return null;
}

// Helper function to get all verses on a specific page
async function getVersesForPage(pageNumber) {
    const pages = await loadMushafPages();
    if (!pages || !pages[pageNumber]) return null;
    
    const pageInfo = pages[pageNumber];
    const verses = [];
    
    if (!pageInfo.multiSurah) {
        // Single surah page
        for (let ayah = pageInfo.startAyah; ayah <= pageInfo.endAyah; ayah++) {
            verses.push({
                surah: pageInfo.surah,
                ayah: ayah,
                surahName: pageInfo.surahName,
                surahNameEn: pageInfo.surahNameEn
            });
        }
    } else {
        // Multi-surah page
        for (const surahData of pageInfo.surahs) {
            for (let ayah = surahData.startAyah; ayah <= surahData.endAyah; ayah++) {
                verses.push({
                    surah: surahData.surah,
                    ayah: ayah,
                    surahName: surahData.surahName,
                    surahNameEn: surahData.surahNameEn
                });
            }
        }
    }
    
    return verses;
}

// Helper function to get page information
async function getPageInfo(pageNumber) {
    const pages = await loadMushafPages();
    if (!pages || !pages[pageNumber]) return null;
    return pages[pageNumber];
}

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        loadMushafPages, 
        getPageForVerse, 
        getVersesForPage,
        getPageInfo 
    };
}