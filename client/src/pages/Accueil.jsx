import React, { useState } from 'react';
import RedirectionAccueil from '../components/redirectionAccueil';
import AffichageSetComplet from '../components/affichageSetComplet';
import AffichageNombresCartes from '../components/affichageNombresCartes';
import AffichageCartesRécentes from '../components/affichageCartesRécentes';
import RechercheAccueil from '../components/rechercheAccueil';
import AffichageRecherche from '../components/affichageRecherche';
import '../styles/accueil.css';

// Composant principal de la page d'accueil
const Accueil = () => {
    // État pour les filtres de recherche
    const [searchFilters, setSearchFilters] = useState({
        set: null,
        pokemon: null,
        rarity: '',
    });

    return (
        <div className='accueil'>
            <div className='affichageCartes'>
                <div className="cartes-top-row">
                    <AffichageNombresCartes />
                    <AffichageSetComplet />
                </div>
                <div className="cartes-bottom-row">
                    <AffichageCartesRécentes />
                </div>
            </div>
            <div className='rechercheAccueil'>
                <AffichageRecherche searchFilters={searchFilters} />
                <RechercheAccueil onSearchFiltersChange={setSearchFilters} />
            </div>
            <div className='redirectionAccueil'>
                <RedirectionAccueil />
            </div>
        </div>
    );
};

export default Accueil;