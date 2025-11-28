import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const [category, setCategory] = useState('people');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const isSearchReady = query.trim().length >= 2;
  const isButtonDisabled = !isSearchReady || isLoading;

  const extractId = (item) => {
    if (!item) return '';
    if (item.uid) return item.uid;
    if (item.url) {
      const parts = item.url.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    }
    return '';
  };

  const resultLabel = (item) => item?.name ?? item?.title ?? 'Unknown';
  const resultPath = (id) => `/${category === 'people' ? 'people' : 'movies'}/${id}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isButtonDisabled) return;

    const trimmedQuery = query.trim();
    setIsLoading(true);
    setError('');
    setHasSearched(true);
    setResults([]);

    try {
      const response = await fetch(
        `/api/swapi/${category}?search=${encodeURIComponent(trimmedQuery)}`
      );
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch (fetchError) {
      setError('Unable to complete the search. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResultState = () => {
    if (isLoading) return <p className={styles.resultsMessage}>Searching...</p>;
    if (error) return <p className={styles.resultsMessage}>{error}</p>;
    if (!hasSearched) {
      return (
        <p className={styles.resultsMessage}>
          Start by searching for your favorite characters or films.
          <br />
          Results will appear here.
        </p>
      );
    }
    if (results.length === 0) {
      return (
        <p className={styles.resultsMessage}>
          There are zero matches.
          <br />
          Use the form to search for People or Movies.
        </p>
      );
    }

    return (
      <ul className={styles.resultsList}>
        {results.map((item) => {
          const id = extractId(item);
          const label = resultLabel(item);
          const linkTarget = id ? resultPath(id) : null;

          return (
            <li key={`${category}-${id || label}`}>
              <span>{label}</span>
              {linkTarget ? (
                <Link to={linkTarget} className={styles.detailButton}>
                  SEE DETAILS
                </Link>
              ) : (
                <span className={styles.detailButtonDisabled}>SEE DETAILS</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1>SWStarter</h1>
      </header>

      <main className={styles.content}>
        <section className={styles.searchCard}>
          <p className={styles.label}>What are you searching for?</p>

          <div className={styles.toggleGroup}>
            <label className={styles.toggle}>
              <input
                type="radio"
                name="category"
                value="people"
                checked={category === 'people'}
                onChange={(e) => setCategory(e.target.value)}
              />
              <span>People</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="radio"
                name="category"
                value="movies"
                checked={category === 'movies'}
                onChange={(e) => setCategory(e.target.value)}
              />
              <span>Movies</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.inputWrapper}>
              <span className={styles.visuallyHidden}>Search term</span>
              <input
                type="text"
                placeholder="e.g. Chewbacca, Yoda, Boba Fett"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className={`${styles.searchButton} ${
                isButtonDisabled ? styles.searchButtonDisabled : styles.searchButtonEnabled
              }`}
              disabled={isButtonDisabled}
            >
              {isLoading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </form>
        </section>

        <section className={styles.resultsCard}>
          <header className={styles.resultsHeader}>
            <h2>Results</h2>
          </header>

          <div className={styles.resultsBody}>{renderResultState()}</div>
        </section>
      </main>
    </div>
  );
}