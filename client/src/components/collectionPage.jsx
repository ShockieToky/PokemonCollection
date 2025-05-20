import React, { useState } from 'react';
import RechercheCollection from '../components/rechercheCollection';
import AffichageCartesCollection from '../components/affichageCartesCollection';

const CollectionPage = () => {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        set: '',
        rarity: '',
        sort: '',
    });

    return (
        <div>
            <RechercheCollection onSearchResults={setSearchFilters} />
            <AffichageCartesCollection searchFilters={searchFilters} />
        </div>
    );
};

export default CollectionPage;