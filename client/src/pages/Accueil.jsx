import React from 'react';
import RedirectionAccueil from '../components/redirectionAccueil';
import AffichageSetComplet from '../components/affichageSetComplet';
import AffichageNombresCartes from '../components/affichageNombresCartes';
import AffichageCartesRécentes from '../components/affichageCartesRécentes';
import RechercheAccueil from '../components/rechercheAccueil';
import AffichageRecherche from '../components/affichageRecherche';

const Accueil = () => {
    return (
        <div className='accueil'>
            <div className='affichageCartes'>
                <AffichageNombresCartes />
                <AffichageSetComplet />
                <AffichageCartesRécentes />
            </div>
            <div className='rechercheAccueil'>
                <h1>Recherche de cartes :</h1>
                <AffichageRecherche />
                <RechercheAccueil />
            </div>
            <div className='redirectionAccueil'>
                <RedirectionAccueil />
            </div>
        </div>
    );
};

export default Accueil;