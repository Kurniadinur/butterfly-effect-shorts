import fs from 'fs';
import path from 'path';

const USER_AGENT = 'ButterflyShortsBot/1.0 (https://github.com/Kurniadinur/butterfly-effect-shorts; educational documentary pipeline)';

// Helper to filter out useless non-documentary images (logos, icons, flags, audio thumbs)
function isValidImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.endsWith('.svg') || lower.endsWith('.svg.png') || lower.endsWith('.gif')) return false;
  if (lower.includes('flag_of_') || lower.includes('symbol_') || lower.includes('icon_') || lower.includes('sound-icon')) return false;
  if (lower.includes('ambox_') || lower.includes('crystal_clear_') || lower.includes('wikimedia-logo')) return false;
  return true;
}

// Helper to ensure search query relevance against article title
function isTitleRelevant(pageTitle, query) {
  if (!pageTitle || !query) return false;
  // Extract significant words (length >= 3, excluding generic keywords)
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['photo', 'image', 'picture', 'sketch', 'drawing', 'portret', 'portrait', 'foto', 'historical', 'sejarah', 'the', 'and', 'for'].includes(w));
  if (words.length === 0) return true;
  const lowerTitle = pageTitle.toLowerCase();
  // Require at least one significant query word to exist in the matched Wikipedia/Commons title
  return words.some((w) => lowerTitle.includes(w));
}

// 1. Wikipedia Pageimages API - collects all valid candidates
async function searchWikipediaAll(query, lang = 'en') {
  const matches = [];
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=6&prop=pageimages&pithumbsize=1280&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return matches;
    const data = await res.json();
    const pages = data.query ? Object.values(data.query.pages) : [];
    for (const p of pages) {
      if (p.thumbnail && p.thumbnail.source && isValidImageUrl(p.thumbnail.source) && isTitleRelevant(p.title, query)) {
        matches.push({
          title: p.title,
          url: p.thumbnail.source,
          source: `wikipedia_${lang}`,
        });
      }
    }
  } catch (err) {
    // silently catch
  }
  return matches;
}

// 2. Wikimedia Commons File Search API - collects all valid candidates
async function searchCommonsAll(query) {
  const matches = [];
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1280&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return matches;
    const data = await res.json();
    const pages = data.query ? Object.values(data.query.pages) : [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      const imgUrl = info?.thumburl || info?.url;
      const cleanTitle = p.title.replace(/^File:/i, '');
      if (imgUrl && isValidImageUrl(imgUrl) && info.mime?.startsWith('image/') && isTitleRelevant(cleanTitle, query)) {
        matches.push({
          title: cleanTitle,
          url: imgUrl,
          source: 'commons',
        });
      }
    }
  } catch (err) {
    // silently catch
  }
  return matches;
}

// 3. Openverse Creative Commons & Public Domain API
async function searchOpenverseAll(query) {
  const matches = [];
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=6`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return matches;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      for (const item of data.results) {
        if (item.url && isValidImageUrl(item.url) && isTitleRelevant(item.title || '', query)) {
          matches.push({
            title: item.title || query,
            url: item.url,
            source: 'openverse',
          });
        }
      }
    }
  } catch (err) {
    // silently catch
  }
  return matches;
}

/**
 * Searches across multiple global archival sources and downloads the highest quality image.
 * Uses random candidate selection among verified matches so repeated runs of the same topic
 * yield fresh, diverse historical archival imagery rather than the exact same thumbnail.
 *
 * @param {string} query - Specific English search query
 * @param {string} fallbackQuery - Secondary query if first yields no results
 * @param {string} destPath - Full filesystem destination path for the saved image
 * @returns {Promise<{ success: boolean, title?: string, source?: string, destPath?: string }>}
 */
export async function searchAndDownloadImage(query, fallbackQuery, destPath) {
  const queries = [query, fallbackQuery].filter(Boolean);

  const allCandidates = [];
  for (const q of queries) {
    // 1. Commons (richest variety of authentic historical photography)
    const commons = await searchCommonsAll(q);
    if (commons.length > 0) allCandidates.push(...commons);

    // 2. Wikipedia EN
    const wiki = await searchWikipediaAll(q, 'en');
    if (wiki.length > 0) allCandidates.push(...wiki);

    // 3. Openverse
    if (allCandidates.length < 2) {
      const openv = await searchOpenverseAll(q);
      if (openv.length > 0) allCandidates.push(...openv);
    }

    if (allCandidates.length >= 3) break;
  }

  if (allCandidates.length === 0) {
    return { success: false };
  }

  // Pick randomly from the valid archival matches to guarantee visual variety
  const candidate = allCandidates[Math.floor(Math.random() * allCandidates.length)];

  if (!candidate || !candidate.url) {
    return { success: false };
  }

  try {
    // Ensure parent directory exists
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const imgRes = await fetch(candidate.url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(12000), // 12s timeout
    });

    if (!imgRes.ok) {
      return { success: false };
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    if (buffer.length < 8192) {
      // Image too small or corrupt (< 8KB)
      return { success: false };
    }

    fs.writeFileSync(destPath, buffer);
    return {
      success: true,
      title: candidate.title,
      source: candidate.source,
      destPath,
      sizeBytes: buffer.length,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
