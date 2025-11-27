import { useEffect, useState } from 'react';

export default function App() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/swapi/people')
      .then((res) => res.json())
      .then((data) => setPeople(data.results || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <h1>Star Wars Characters</h1>
      <ul>
        {people.map((person) => (
          <li key={person.uid}>{person.name}</li>
        ))}
      </ul>
    </main>
  );
}