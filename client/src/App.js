import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Wishlist from './pages/Wishlist';
import Collection from './pages/Collection';
import AjoutCarte from './pages/AjoutCarte';
import SetPage from './pages/Set';
// import TousLesPokemons from './components/TousLesPokemons';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/ajoutcarte" element={<AjoutCarte />} />
        <Route path="/set" element={<SetPage />} />
        {/* <Route path="/tous-les-pokemons" element={<TousLesPokemons />} /> */}

      </Routes>
    </Router>
  );
}

export default App;