import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar     from './components/Navbar';
import Dashboard  from './pages/Dashboard';
import Projects   from './pages/Projects';
import Benchmarks from './pages/Benchmarks';
import About      from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"            element={<Dashboard  />} />
          <Route path="/projects"    element={<Projects   />} />
          <Route path="/benchmarks"  element={<Benchmarks />} />
          <Route path="/about"       element={<About      />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
