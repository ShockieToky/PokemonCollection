import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Wishlist from './pages/Wishlist';
import Collection from './pages/Collection';
import AjoutCarte from './pages/AjoutCarte';
// import TousLesPokemons from './components/TousLesPokemons';
// import TousLesSets from './components/TousLesSets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/ajoutcarte" element={<AjoutCarte />} />
        {/* <Route path="/tous-les-pokemons" element={<TousLesPokemons />} /> */}
        {/* <Route path="/tous-les-sets" element={<TousLesSets />} /> */}
      </Routes>
    </Router>
  );
}

export default App;