import React from 'react';
import AffichageCartesWishlist from '../components/affichageCartesWishlist';
import RechercheWishlist from '../components/rechercheWishlist';

const Wishlist = () => {
    return (
        <div className='wishlist'>
            <div className='rechercheWishlist'>
                <h1>Recherche de cartes :</h1>
                <RechercheWishlist />
            </div>
            <div className='affichageCartes'>
                <AffichageCartesWishlist />
            </div>
        </div>
    );
};

export default Wishlist;