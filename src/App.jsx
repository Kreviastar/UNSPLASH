import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Box as BoxIcon,
  Search,
  ArrowLeft,
  Download,
  Plus,
  X,
  Trash2,
  Image as ImageIcon,
  ArrowUpRight,
  LoaderCircle,
  FolderPlus,
  Check,
} from "lucide-react";
import { getPhoto, hasApiKey, searchPhotos, trackDownload } from "./api";
import {
  compactPhoto,
  photoBelongs,
  readCollections,
  writeCollections,
} from "./storage";

function Header() {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand-mark">
          <BoxIcon size={22} strokeWidth={2.2} />
        </span>
        <span>UnsplashBox</span>
      </Link>
      <nav>
        <NavLink end to="/">
          Home
        </NavLink>
        <NavLink to="/collections">Collections</NavLink>
      </nav>
    </header>
  );
}
function PhotoCard({ photo }) {
  return (
    <Link
      className="photo-card"
      to={`/photo/${photo.id}`}
      aria-label={`View ${photo.alt_description || "photo"}`}
    >
      <img
        src={photo.urls?.small || photo.urls?.regular}
        alt={photo.alt_description || "Unsplash photograph"}
        loading="lazy"
      />
      <span className="photo-overlay">
        <span>{photo.user?.name || "Unsplash photographer"}</span>
        <ArrowUpRight size={17} />
      </span>
    </Link>
  );
}
function SearchBox({ initial = "", onSearch, compact = false }) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  function submit(event) {
    event.preventDefault();
    const query = value.trim();
    if (query) onSearch(query);
  }
  return (
    <form
      className={`search-box ${compact ? "search-compact" : ""}`}
      onSubmit={submit}
    >
      <input
        aria-label="Search Unsplash images"
        placeholder="Enter your keywords..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="clear-search"
          aria-label="Clear search"
          onClick={() => setValue("")}
        >
          <X size={16} />
        </button>
      )}
      <button type="submit" aria-label="Search">
        <Search size={21} />
      </button>
    </form>
  );
}
function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [term, setTerm] = useState(query);
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  useEffect(() => {
    setTerm(query);
    if (!query) {
      setPhotos([]);
      setError("");
      return;
    }
    let cancelled = false;
    setBusy(true);
    setError("");
    searchPhotos(query, 1)
      .then((data) => {
        if (!cancelled) {
          setPhotos(data.results);
          setTotal(data.total);
          setPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPhotos([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);
  async function search(value) {
    setParams({ q: value });
  }
  async function loadMore() {
    setBusy(true);
    setError("");
    try {
      const data = await searchPhotos(query, page + 1);
      setPhotos((old) => [...old, ...data.results]);
      setPage(page + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      {!query ? (
        <section className="hero">
          <div className="ambient ambient-left" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} className={`tile tile-${i + 1}`} />
            ))}
            <img
              className="float-photo float-one"
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=180&auto=format&fit=crop&q=80"
              alt="Mountain landscape"
            />
            <img
              className="float-photo float-two"
              src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=180&auto=format&fit=crop&q=80"
              alt="Night sky"
            />
            <img
              className="float-photo float-three"
              src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=180&auto=format&fit=crop&q=80"
              alt="Abstract landscape"
            />
          </div>
          <div className="ambient ambient-right" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} className={`tile tile-${i + 1}`} />
            ))}
            <img
              className="float-photo float-four"
              src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=180&auto=format&fit=crop&q=80"
              alt="Architecture"
            />
            <img
              className="float-photo float-five"
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=180&auto=format&fit=crop&q=80"
              alt="Lake landscape"
            />
            <img
              className="float-photo float-six"
              src="https://images.unsplash.com/photo-1472396961693-142e6e269027?w=180&auto=format&fit=crop&q=80"
              alt="Nature"
            />
          </div>
          <div className="hero-content">
            <h1>Search</h1>
            <p>Search high-resolution images from Unsplash</p>
            <SearchBox onSearch={search} />
          </div>
        </section>
      ) : (
        <section className="results-page">
          <div className="results-heading">
            <div>
              <span className="eyebrow">UNSPLASH SEARCH</span>
              <h1>{query}</h1>
              <p>
                {total
                  ? `${total.toLocaleString()} photos to explore`
                  : "Discover something beautiful"}
              </p>
            </div>
            <SearchBox initial={term} compact onSearch={search} />
          </div>
          {error && (
            <div className="notice error">
              {error}
              {!hasApiKey() && (
                <p>
                  For setup instructions, see the README and add your Unsplash
                  access key.
                </p>
              )}
            </div>
          )}
          {busy && photos.length === 0 ? (
            <Loading />
          ) : photos.length ? (
            <>
              <div className="photo-grid">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
              {photos.length < total && (
                <button
                  className="button secondary load-more"
                  onClick={loadMore}
                  disabled={busy}
                >
                  {busy ? <LoaderCircle className="spin" size={17} /> : null}{" "}
                  Load more photos
                </button>
              )}
            </>
          ) : (
            !error && (
              <div className="empty-state">
                <ImageIcon size={30} />
                <h2>No photos yet</h2>
                <p>Try another keyword to find what you’re looking for.</p>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}
function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" size={25} />
      <span>Finding beautiful images…</span>
    </div>
  );
}
function formatDate(date) {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}
function PhotoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [collections, setCollections] = useState(readCollections);
  const [modal, setModal] = useState(false);
  const [collectionQuery, setCollectionQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [downloadBusy, setDownloadBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError("");
    getPhoto(id)
      .then((data) => {
        if (!cancelled) setPhoto(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  const savedPhoto = useMemo(
    () => (photo ? compactPhoto(photo) : null),
    [photo],
  );
  const eligible = collections.filter(
    (c) =>
      !photoBelongs(c, id) &&
      c.title.toLowerCase().includes(collectionQuery.toLowerCase()),
  );
  function update(next) {
    setCollections(writeCollections(next));
  }
  function addToCollection(collectionId) {
    if (!savedPhoto) return;
    update(
      collections.map((c) =>
        c.id === collectionId ? { ...c, photos: [...c.photos, savedPhoto] } : c,
      ),
    );
    setCollectionQuery("");
    setModal(false);
  }
  function removeFromCollection(collectionId) {
    update(
      collections.map((c) =>
        c.id === collectionId
          ? { ...c, photos: c.photos.filter((p) => p.id !== id) }
          : c,
      ),
    );
  }
  function createAndAdd(event) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || !savedPhoto) return;
    const created = {
      id: `collection-${Date.now()}`,
      title,
      description: "",
      photos: [savedPhoto],
    };
    update([...collections, created]);
    setNewTitle("");
    setModal(false);
  }
  async function download() {
    if (!photo) return;
    setDownloadBusy(true);
    try {
      const url = await trackDownload(photo);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.download = `${photo.id}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadBusy(false);
    }
  }
  if (busy)
    return (
      <main className="page-shell">
        <Loading />
      </main>
    );
  if (error && !photo)
    return (
      <main className="page-shell">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} /> Back
        </button>
        <div className="notice error">{error}</div>
      </main>
    );
  if (!photo) return null;
  const memberships = collections.filter((c) => photoBelongs(c, id));
  return (
    <main className="page-shell detail-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={17} /> Back to search
      </button>
      <div className="detail-layout">
        <div className="detail-image-wrap">
          <img
            className="detail-image"
            src={photo.urls?.regular || photo.urls?.full}
            alt={
              photo.alt_description ||
              photo.description ||
              "Unsplash photograph"
            }
          />
          <span className="image-credit">Photo from Unsplash</span>
        </div>
        <aside className="detail-sidebar">
          <div className="detail-actions">
            <button className="button primary" onClick={() => setModal(true)}>
              <Plus size={17} /> Add to Collection
            </button>
            <button
              className="icon-button"
              onClick={download}
              disabled={downloadBusy}
              aria-label="Download image"
              title="Download image"
            >
              {downloadBusy ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Download size={18} />
              )}
            </button>
          </div>
          <div className="photographer">
            <div className="avatar">
              {(photo.user?.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{photo.user?.name || "Unknown photographer"}</strong>
              <a
                href={photo.user?.links?.html || "#"}
                target="_blank"
                rel="noreferrer"
              >
                @{photo.user?.username || "unsplash"}
              </a>
            </div>
          </div>
          <div className="meta-block">
            <span className="meta-label">PUBLISHED</span>
            <p>{formatDate(photo.created_at)}</p>
          </div>
          {photo.description && (
            <div className="meta-block">
              <span className="meta-label">ABOUT THIS PHOTO</span>
              <p>{photo.description}</p>
            </div>
          )}
          <div className="collection-section">
            <div className="section-title">
              <h2>Collections</h2>
              <span>{memberships.length}</span>
            </div>
            {memberships.length ? (
              <div className="membership-list">
                {memberships.map((c) => (
                  <div className="membership" key={c.id}>
                    <Link to={`/collections/${c.id}`}>
                      <span className="mini-cover">
                        {c.photos[0]?.urls?.thumb ? (
                          <img src={c.photos[0].urls.thumb} alt="" />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                      </span>
                      <span>{c.title}</span>
                    </Link>
                    <button
                      className="remove-button"
                      title={`Remove from ${c.title}`}
                      aria-label={`Remove from ${c.title}`}
                      onClick={() => removeFromCollection(c.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted small">
                This photo hasn’t been saved to a collection yet.
              </p>
            )}
          </div>
          {error && <div className="notice error">{error}</div>}
        </aside>
      </div>
      {modal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="modal-title">Add to a collection</h2>
                <p>Choose where you want to save this photo.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setModal(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>
            <label className="field-search">
              <Search size={17} />
              <input
                autoFocus
                value={collectionQuery}
                onChange={(e) => setCollectionQuery(e.target.value)}
                placeholder="Search your collections"
              />
            </label>
            <div className="collection-options">
              {eligible.map((c) => (
                <button
                  className="collection-option"
                  key={c.id}
                  onClick={() => addToCollection(c.id)}
                >
                  <span className="option-icon">
                    <ImageIcon size={18} />
                  </span>
                  <span>
                    <strong>{c.title}</strong>
                    <small>
                      {c.photos.length}{" "}
                      {c.photos.length === 1 ? "photo" : "photos"}
                    </small>
                  </span>
                  <Plus size={17} />
                </button>
              ))}
              {eligible.length === 0 && (
                <p className="empty-inline">
                  No matching collections available. This photo may already
                  belong to them.
                </p>
              )}
            </div>
            <form className="create-collection" onSubmit={createAndAdd}>
              <label htmlFor="new-collection">Or create a new collection</label>
              <div>
                <input
                  id="new-collection"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Collection name"
                  maxLength={50}
                />
                <button
                  className="button primary"
                  type="submit"
                  disabled={!newTitle.trim()}
                >
                  <FolderPlus size={16} /> Create & add
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
function CollectionsPage() {
  const [collections, setCollections] = useState(readCollections);
  const [title, setTitle] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  function create(e) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    setCollections(
      writeCollections([
        ...collections,
        {
          id: `collection-${Date.now()}`,
          title: clean,
          description: "",
          photos: [],
        },
      ]),
    );
    setTitle("");
    setShowCreate(false);
  }
  return (
    <main className="page-shell collections-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR LIBRARY</span>
          <h1>Collections</h1>
          <p>Keep your favorite visual ideas organized.</p>
        </div>
        <button
          className="button primary"
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus size={17} /> New collection
        </button>
      </div>
      {showCreate && (
        <form className="create-inline" onSubmit={create}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your collection"
            maxLength={50}
          />
          <button
            className="button primary"
            type="submit"
            disabled={!title.trim()}
          >
            Create
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowCreate(false)}
            aria-label="Cancel"
          >
            <X size={18} />
          </button>
        </form>
      )}
      {collections.length ? (
        <div className="collection-grid">
          {collections.map((c) => (
            <Link
              to={`/collections/${c.id}`}
              className="collection-card"
              key={c.id}
            >
              <div className="collection-cover">
                {c.photos.length ? (
                  <>
                    <img
                      src={c.photos[0].urls?.regular || c.photos[0].urls?.small}
                      alt=""
                    />
                    <div className="cover-count">
                      {c.photos.length}{" "}
                      {c.photos.length === 1 ? "photo" : "photos"}
                    </div>
                  </>
                ) : (
                  <div className="empty-cover">
                    <ImageIcon size={30} />
                    <span>Ready for inspiration</span>
                  </div>
                )}
              </div>
              <div className="collection-card-info">
                <div>
                  <h2>{c.title}</h2>
                  <p>{c.description || "A collection of saved images"}</p>
                </div>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FolderPlus size={30} />
          <h2>Your library is empty</h2>
          <p>Create a collection to start saving images.</p>
        </div>
      )}
    </main>
  );
}
function CollectionDetail() {
  const { id } = useParams();
  const [collections, setCollections] = useState(readCollections);
  const navigate = useNavigate();
  const collection = collections.find((c) => c.id === id);
  function remove(photoId) {
    const next = writeCollections(
      collections.map((c) =>
        c.id === id
          ? { ...c, photos: c.photos.filter((p) => p.id !== photoId) }
          : c,
      ),
    );
    setCollections(next);
  }
  function deleteCollection() {
    if (
      !window.confirm(
        `Delete "${collection.title}"? This only removes the collection from this browser.`,
      )
    )
      return;
    writeCollections(collections.filter((c) => c.id !== id));
    navigate("/collections");
  }
  if (!collection)
    return (
      <main className="page-shell">
        <button className="back-link" onClick={() => navigate("/collections")}>
          <ArrowLeft size={17} /> Collections
        </button>
        <div className="empty-state">
          <h2>Collection not found</h2>
          <p>It may have been removed from this browser.</p>
        </div>
      </main>
    );
  return (
    <main className="page-shell collection-detail-page">
      <button className="back-link" onClick={() => navigate("/collections")}>
        <ArrowLeft size={17} /> All collections
      </button>
      <div className="page-heading">
        <div>
          <span className="eyebrow">COLLECTION</span>
          <h1>{collection.title}</h1>
          <p>
            {collection.photos.length}{" "}
            {collection.photos.length === 1 ? "photo" : "photos"} saved here
          </p>
        </div>
        <button
          className="button secondary danger-button"
          onClick={deleteCollection}
        >
          <Trash2 size={16} /> Delete collection
        </button>
      </div>
      {collection.photos.length ? (
        <div className="photo-grid">
          {collection.photos.map((photo) => (
            <div className="saved-photo" key={photo.id}>
              <PhotoCard photo={photo} />
              <button
                className="saved-remove"
                title="Remove from collection"
                aria-label="Remove from collection"
                onClick={() => remove(photo.id)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ImageIcon size={30} />
          <h2>This collection is empty</h2>
          <p>Open any photo and choose “Add to Collection” to save it here.</p>
          <Link className="button primary" to="/">
            Explore photos
          </Link>
        </div>
      )}
    </main>
  );
}
export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photo/:id" element={<PhotoPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route
          path="*"
          element={
            <main className="page-shell">
              <div className="empty-state">
                <h1>Page not found</h1>
                <Link className="button primary" to="/">
                  Go home
                </Link>
              </div>
            </main>
          }
        />
      </Routes>
      <footer className="footer">
        <span>UnsplashBox</span>
        <span>Made for curious eyes.</span>
      </footer>
    </>
  );
}
