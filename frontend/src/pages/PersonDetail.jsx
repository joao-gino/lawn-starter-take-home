import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './PersonDetail.module.css';

const personRequestCache = new Map();
const filmRequestCache = new Map();

const normalizePerson = (raw) => raw?.result?.properties ?? raw?.properties ?? raw ?? null;

const extractIdFromUrl = (url = '') => {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

function loadPerson(id) {
  const cached = personRequestCache.get(id);
  if (cached?.status === 'resolved') return Promise.resolve(cached.data);
  if (cached?.status === 'pending') return cached.promise;

  const requestPromise = fetch(`/api/swapi/people/${id}`).then((response) => {
    if (!response.ok) throw new Error('Failed to fetch person');
    return response.json();
  });

  const wrappedPromise = requestPromise
    .then((data) => {
      const normalized = normalizePerson(data);
      personRequestCache.set(id, { status: 'resolved', data: normalized });
      return normalized;
    })
    .catch((error) => {
      personRequestCache.delete(id);
      throw error;
    });

  personRequestCache.set(id, { status: 'pending', promise: wrappedPromise });
  return wrappedPromise;
}

function loadFilm(url) {
  const id = extractIdFromUrl(url);
  if (!id) return Promise.resolve(null);

  const cached = filmRequestCache.get(id);
  if (cached?.status === 'resolved') return Promise.resolve(cached.data);
  if (cached?.status === 'pending') return cached.promise;

  const requestPromise = fetch(`/api/swapi/films/${id}`).then((response) => {
    if (!response.ok) throw new Error('Failed to fetch film');
    return response.json();
  });

  const wrappedPromise = requestPromise
    .then((data) => {
      const normalized =
        data?.result?.properties ?? data?.properties ?? data ?? null;
      filmRequestCache.set(id, { status: 'resolved', data: normalized });
      return normalized;
    })
    .catch((error) => {
      filmRequestCache.delete(id);
      throw error;
    });

  filmRequestCache.set(id, { status: 'pending', promise: wrappedPromise });
  return wrappedPromise;
}

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [films, setFilms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilmsLoading, setIsFilmsLoading] = useState(false);
  const [error, setError] = useState('');

  const detailPairs = useMemo(
    () => [
      { label: 'Birth Year', value: person?.birth_year },
      { label: 'Gender', value: person?.gender },
      { label: 'Eye Color', value: person?.eye_color },
      { label: 'Hair Color', value: person?.hair_color },
      { label: 'Height', value: person?.height ? `${person.height} cm` : undefined },
      { label: 'Mass', value: person?.mass ? `${person.mass} kg` : undefined },
    ],
    [person]
  );

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');
    setPerson(null);
    setFilms([]);

    loadPerson(id)
      .then((data) => {
        if (!isActive) return;
        setPerson(data);
      })
      .catch(() => {
        if (!isActive) return;
        setError('Unable to load this person.');
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
    if (!person?.films?.length) {
      setFilms([]);
      return;
    }

    let isActive = true;
    setIsFilmsLoading(true);

    Promise.all(person.films.map((filmUrl) => loadFilm(filmUrl).catch(() => null)))
      .then((filmResults) => {
        if (!isActive) return;
        const normalizedFilms = filmResults
          .map((film, index) => {
            const fallbackId = extractIdFromUrl(person.films[index]);
            return {
              id: extractIdFromUrl(film?.url) || fallbackId,
              title: film?.title ?? `Film #${fallbackId}`,
            };
          })
          .filter((film) => film.id);
        setFilms(normalizedFilms);
      })
      .finally(() => {
        if (!isActive) return;
        setIsFilmsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [person]);

  return (
    <div className={styles.screen}>
      <main className={styles.content}>
        <section className={styles.card}>
          {isLoading && <p className={styles.status}>Loading details...</p>}
          {!isLoading && error && <p className={styles.status}>{error}</p>}
          {!isLoading && !error && person && (
            <>
              <h1 className={styles.name}>{person.name}</h1>

              <div className={styles.grid}>
                <div className={styles.panel}>
                  <h2>Details</h2>
                  <hr />
                  <ul className={styles.detailList}>
                    {detailPairs.map(({ label, value }) => (
                      <li key={label}>
                        <span>{label}:</span> {value ?? '—'}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.panel}>
                  <h2>Movies</h2>
                  <hr />
                  {isFilmsLoading && <p className={styles.statusSmall}>Loading films...</p>}
                  {!isFilmsLoading && films.length === 0 && (
                    <p className={styles.statusSmall}>No movies available.</p>
                  )}
                  {!isFilmsLoading && films.length > 0 && (
                    <ul className={styles.movieList}>
                      {films.map((film) => (
                        <li key={film.id}>
                          <Link to={`/movies/${film.id}`}>{film.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <Link to="/" className={styles.backButton}>
                BACK TO SEARCH
              </Link>
            </>
          )}
          {!isLoading && !error && !person && (
            <p className={styles.status}>No details available.</p>
          )}
        </section>
      </main>
    </div>
  );
}