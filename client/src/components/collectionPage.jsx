import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RechercheCollection from '../components/rechercheCollection';
import AffichageCartesCollection from '../components/affichageCartesCollection';
import '../styles/collection.css';

const CollectionPage = () => {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        set: '',
        rarity: '',
        sort: '',
    });

    const navigate = useNavigate();

    return (
        <div className='collection'>
            <div className='rechercheCollection'>
                <RechercheCollection onSearchResults={setSearchFilters} />
                <button onClick={() => navigate('/')}>
                    Retour à l'accueil
                </button>
            </div>
            <div className='affichageCartesC'>
                <AffichageCartesCollection searchFilters={searchFilters} />
            </div>
        </div>
    );
};

export default CollectionPage;