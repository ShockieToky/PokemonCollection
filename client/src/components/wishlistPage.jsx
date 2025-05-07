import React, { useState } from 'react';
import RechercheWishlist from './rechercheWishlist';
import AffichageCartesWishlist from './affichageCartesWishlist';

const WishlistPage = () => {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        set: '',
        rarity: '',
    });

    const handleSearchResults = (filters) => {
        setSearchFilters(filters);
    };

    return (
        <div>
            <RechercheWishlist onSearchResults={handleSearchResults} />
            <AffichageCartesWishlist searchFilters={searchFilters} />
        </div>
    );
};

export default WishlistPage;