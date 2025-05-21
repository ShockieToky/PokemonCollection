import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectionAccueil = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Redirections</h1>
            <button onClick={() => navigate('/wishlist')}>Voir la Wishlist</button>
            <button onClick={() => navigate('/collection')}>Collection</button>
            <button onClick={() => navigate('/ajoutcarte')}>Ajouter une Carte</button>
            <button onClick={() => navigate('/tous-les-pokemons')}>Tous les Pokémons</button>
            <button onClick={() => navigate('/set')}>Tous les Sets</button>
        </div>
    );
};

export default RedirectionAccueil;