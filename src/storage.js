const KEY = 'unsplashbox.collections.v1';
const initial = [
  { id: 'favorites', title: 'Favorites', description: 'Images worth keeping', photos: [] },
  { id: 'inspiration', title: 'Inspiration', description: 'Ideas for later', photos: [] },
  { id: 'wallpapers', title: 'Wallpapers', description: 'A little visual calm', photos: [] }
];
export function readCollections() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(stored) ? stored : initial;
  } catch { return initial; }
}
export function writeCollections(collections) {
  localStorage.setItem(KEY, JSON.stringify(collections));
  return collections;
}
export function photoBelongs(collection, photoId) {
  return collection.photos.some(photo => photo.id === photoId);
}
export function compactPhoto(photo) {
  return {
    id: photo.id,
    urls: photo.urls,
    alt_description: photo.alt_description || photo.description || 'Unsplash photograph',
    description: photo.description || '',
    user: { name: photo.user?.name || 'Unknown photographer', username: photo.user?.username || '' },
    created_at: photo.created_at || ''
  };
}
