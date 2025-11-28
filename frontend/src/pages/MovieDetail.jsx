import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './MovieDetail.module.css';

const movieRequestCache = new Map();
const characterRequestCache = new Map();

const extractIdFromUrl = (url = '') => {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

const normalizeMovie = (raw) => raw?.result?.properties ?? raw ?? null;
const normalizeCharacter = (raw) => raw?.result?.properties ?? raw ?? null;

function loadMovie(id) {
  const cached = movieRequestCache.get(id);
  if (cached?.status === 'resolved') return Promise.resolve(cached.data);
  if (cached?.status === 'pending') return cached.promise;

  const requestPromise = fetch(`/api/swapi/movies/${id}`).then((response) => {
    if (!response.ok) throw new Error('Failed to fetch movie');
    return response.json();
  });

  const wrappedPromise = requestPromise
    .then((data) => {
      const normalized = normalizeMovie(data);
      movieRequestCache.set(id, { status: 'resolved', data: normalized });
      return normalized;
    })
    .catch((error) => {
      movieRequestCache.delete(id);
      throw error;
    });

  movieRequestCache.set(id, { status: 'pending', promise: wrappedPromise });
  return wrappedPromise;
}

function loadCharacter(url) {
  const id = extractIdFromUrl(url);
  if (!id) return Promise.resolve(null);

  const cached = characterRequestCache.get(id);
  if (cached?.status === 'resolved') return Promise.resolve(cached.data);
  if (cached?.status === 'pending') return cached.promise;

  const requestPromise = fetch(`/api/swapi/people/${id}`).then((response) => {
    if (!response.ok) throw new Error('Failed to fetch character');
    return response.json();
  });

  const wrappedPromise = requestPromise
    .then((data) => {
      const normalized = normalizeCharacter(data);
      characterRequestCache.set(id, { status: 'resolved', data: normalized });
      return normalized;
    })
    .catch((error) => {
      characterRequestCache.delete(id);
      throw error;
    });

  characterRequestCache.set(id, { status: 'pending', promise: wrappedPromise });
  return wrappedPromise;
}

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCharactersLoading, setIsCharactersLoading] = useState(false);
  const [error, setError] = useState('');

  const openingParagraphs = useMemo(() => {
    if (!movie?.opening_crawl) return [];
    return movie.opening_crawl
      .split(/\r?\n\s*\r?\n/g)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }, [movie]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');
    setMovie(null);
    setCharacters([]);

    loadMovie(id)
      .then((data) => {
        if (!isActive) return;
        setMovie(data);
      })
      .catch(() => {
        if (!isActive) return;
        setError('Unable to load this movie.');
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!movie?.characters?.length) {
      setCharacters([]);
      return;
    }

    let isActive = true;
    setIsCharactersLoading(true);

    Promise.all(
      movie.characters.map((characterUrl) =>
        loadCharacter(characterUrl).catch(() => null)
      )
    )
      .then((characterResults) => {
        if (!isActive) return;
        const normalizedCharacters = characterResults
          .map((character, index) => {
            const fallbackId = extractIdFromUrl(movie.characters[index]);
            return {
              id: extractIdFromUrl(character?.url) || fallbackId,
              name: character?.name ?? `Character #${fallbackId}`,
            };
          })
          .filter((character) => character.id);
        setCharacters(normalizedCharacters);
      })
      .finally(() => {
        if (!isActive) return;
        setIsCharactersLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [movie]);

  return (
    <div className={styles.screen}>
      <main className={styles.content}>
        <section className={styles.card}>
          {isLoading && <p className={styles.status}>Loading movie...</p>}
          {!isLoading && error && <p className={styles.status}>{error}</p>}
          {!isLoading && !error && movie && (
            <>
              <h1 className={styles.title}>{movie.title}</h1>

              <div className={styles.grid}>
                <article className={styles.panel}>
                  <h2>Opening Crawl</h2>
                  <hr />
                  <div className={styles.openingText}>
                    {openingParagraphs.length > 0 ? (
                      openingParagraphs.map((text, index) => (
                        <p key={index}>{text}</p>
                      ))
                    ) : (
                      <p>No opening crawl available.</p>
                    )}
                  </div>
                </article>

                <article className={styles.panel}>
                  <h2>Characters</h2>
                  <hr />
                  {isCharactersLoading && (
                    <p className={styles.statusSmall}>Loading characters...</p>
                  )}
                  {!isCharactersLoading && characters.length === 0 && (
                    <p className={styles.statusSmall}>No characters listed.</p>
                  )}
                  {!isCharactersLoading && characters.length > 0 && (
                    <div className={styles.characterList}>
                      {characters.map((character, index) => (
                        <span key={character.id}>
                          <Link to={`/people/${character.id}`}>{character.name}</Link>
                          {index < characters.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </div>

              <Link to="/" className={styles.backButton}>
                BACK TO SEARCH
              </Link>
            </>
          )}
          {!isLoading && !error && !movie && (
            <p className={styles.status}>No movie information available.</p>
          )}
        </section>
      </main>
    </div>
  );
}