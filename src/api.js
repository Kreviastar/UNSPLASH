const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const API = 'https://api.unsplash.com';

async function request(path) {
  if (!ACCESS_KEY) throw new Error('Add your Unsplash Access Key to .env (VITE_UNSPLASH_ACCESS_KEY) to enable image search.');
  const response = await fetch(`${API}${path}`, { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Unsplash API limit reached or access denied. Check your developer app and API limits.');
    if (response.status === 404) throw new Error('That photo could not be found.');
    throw new Error(`Unsplash request failed (${response.status}). Please try again.`);
  }
  return response.json();
}

export async function searchPhotos(query, page = 1) {
  const data = await request(`/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=24&order_by=relevant`);
  return { results: data.results, total: data.total, totalPages: data.total_pages };
}
export async function getPhoto(id) { return request(`/photos/${encodeURIComponent(id)}`); }
export async function trackDownload(photo) {
  const url = photo?.links?.download_location;
  if (!url || !ACCESS_KEY) return photo?.urls?.full || photo?.urls?.regular;
  const data = await request(url.replace(API, ''));
  return data?.url || photo?.urls?.full || photo?.urls?.regular;
}
export function hasApiKey() { return Boolean(ACCESS_KEY); }
