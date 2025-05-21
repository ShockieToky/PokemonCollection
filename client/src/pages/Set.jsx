import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoSet from '../components/infoSet';
import AffichageSet from '../components/affichageSet';
import '../styles/set.css';

const SetPage = () => {
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        set: '',
        rarity: '',
        sort: '',
    });

    const navigate = useNavigate();

    return (
        <div className='set'>
            <div className='rechercheSet'>
                <InfoSet onSearchResults={setSearchFilters} />
                <button onClick={() => navigate('/')}>
                    Retour à l'accueil
                </button>
            </div>
            <div className='affichageCartesS'>
                <AffichageSet setId={searchFilters.set} />
            </div>
        </div>
    );
}

export default SetPage;