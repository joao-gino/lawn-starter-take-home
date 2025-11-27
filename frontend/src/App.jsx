import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PersonDetail from './pages/PersonDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/people/:id" element={<PersonDetail />} />
    </Routes>
  );
}