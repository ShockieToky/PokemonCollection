import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectionAccueil = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1 className='titre-redirection'>Redirections</h1>
            <div className='les-boutons'>
                <button className='bouton-redirection' onClick={() => navigate('/wishlist')}>Voir la Wishlist</button>
                <button className='bouton-redirection' onClick={() => navigate('/collection')}>Collection</button>
                <button className='bouton-redirection' onClick={() => navigate('/ajoutcarte')}>Ajouter une Carte</button>
                <button className='bouton-redirection' onClick={() => navigate('/set')}>Tous les Sets</button>
            </div>
            <a href='https://github.com/ShockieToky/PokemonCollection' target='_blank'>Site fait par Aymerick</a>
        </div>
    );
};

export default RedirectionAccueil;