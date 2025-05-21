import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RechercheWishlist from '../components/rechercheWishlist';
import AffichageCartesWishlist from '../components/affichageCartesWishlist';
import '../styles/wishlist.css';

const WishlistPage = () => {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        set: '',
        rarity: '',
        sort: '',
    });

    const navigate = useNavigate();

    return (
        <div className='wishlist'>

            <div className='rechercheWishlist'>
                <RechercheWishlist onSearchResults={setSearchFilters} />
                <button onClick={() => navigate('/')}>
                    Retour à l'accueil
                </button>
            </div>
            <div className='affichageCartesW'>
                <AffichageCartesWishlist searchFilters={searchFilters} />
            </div>
        </div>
    );
};

export default WishlistPage;