import React, { useState } from 'react';
import RechercheWishlist from '../components/rechercheWishlist';
import AffichageCartesWishlist from '../components/affichageCartesWishlist';

const WishlistPage = () => {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        set: '',
        rarity: '',
        sort: '',
    });

    return (
        <div>
            <RechercheWishlist onSearchResults={setSearchFilters} />
            <AffichageCartesWishlist searchFilters={searchFilters} />
        </div>
    );
};

export default WishlistPage;