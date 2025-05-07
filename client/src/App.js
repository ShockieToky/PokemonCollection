import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Wishlist from './pages/Wishlist';
// import TousLesPokemons from './components/TousLesPokemons';
// import CollectionActuelle from './components/CollectionActuelle';
// import AjouterUneCarte from './components/AjouterUneCarte';
// import TousLesSets from './components/TousLesSets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/wishlist" element={<Wishlist />} />
        {/* <Route path="/tous-les-pokemons" element={<TousLesPokemons />} /> */}
        {/* <Route path="/collection-actuelle" element={<CollectionActuelle />} /> */}
        {/* <Route path="/ajouter-une-carte" element={<AjouterUneCarte />} /> */}
        {/* <Route path="/tous-les-sets" element={<TousLesSets />} /> */}
      </Routes>
    </Router>
  );
}

export default App;