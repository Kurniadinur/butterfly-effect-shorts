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

// 1. Wikipedia Pageimages API
async function searchWikipedia(query, lang = 'en') {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=0&gsrlimit=4&prop=pageimages&pithumbsize=1280&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query ? Object.values(data.query.pages) : [];
    // Sort pages by index/relevance
    pages.sort((a, b) => (a.index || 99) - (b.index || 99));
    for (const p of pages) {
      if (p.thumbnail && p.thumbnail.source && isValidImageUrl(p.thumbnail.source)) {
        return {
          title: p.title,
          url: p.thumbnail.source,
          source: `wikipedia_${lang}`,
        };
      }
    }
  } catch (err) {
    // silently catch network glitch
  }
  return null;
}

// 2. Wikimedia Commons File Search API
async function searchCommons(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1280&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query ? Object.values(data.query.pages) : [];
    for (const p of pages) {
      const info = p.imageinfo?.[0];
      const imgUrl = info?.thumburl || info?.url;
      if (imgUrl && isValidImageUrl(imgUrl) && info.mime?.startsWith('image/')) {
        return {
          title: p.title.replace(/^File:/i, ''),
          url: imgUrl,
          source: 'commons',
        };
      }
    }
  } catch (err) {
    // silently catch
  }
  return null;
}

// 3. Openverse Creative Commons & Public Domain API
async function searchOpenverse(query) {
  try {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=5`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      for (const item of data.results) {
        if (item.url && isValidImageUrl(item.url)) {
          return {
            title: item.title || query,
            url: item.url,
            source: 'openverse',
          };
        }
      }
    }
  } catch (err) {
    // silently catch
  }
  return null;
}

/**
 * Searches across multiple global archival sources and downloads the highest quality image.
 *
 * @param {string} query - Specific English search query
 * @param {string} fallbackQuery - Secondary query if first yields no results
 * @param {string} destPath - Full filesystem destination path for the saved image
 * @returns {Promise<{ success: boolean, title?: string, source?: string, destPath?: string }>}
 */
export async function searchAndDownloadImage(query, fallbackQuery, destPath) {
  const queries = [query, fallbackQuery].filter(Boolean);

  let candidate = null;
  for (const q of queries) {
    // Try Wikipedia EN
    candidate = await searchWikipedia(q, 'en');
    if (candidate) break;

    // Try Wikimedia Commons
    candidate = await searchCommons(q);
    if (candidate) break;

    // Try Openverse
    candidate = await searchOpenverse(q);
    if (candidate) break;

    // Try Wikipedia ID
    candidate = await searchWikipedia(q, 'id');
    if (candidate) break;
  }

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
