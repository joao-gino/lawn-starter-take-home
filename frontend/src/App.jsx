import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PersonDetail from './pages/PersonDetail';
import MovieDetail from './pages/MovieDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/people/:id" element={<PersonDetail />} />
      <Route path="/movies/:id" element={<MovieDetail />} />
    </Routes>
  );
}