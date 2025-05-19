import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageSetComplet = () => {
    const [set, setSet] = useState(null);

    useEffect(() => {
        // Récupération du set le plus complet depuis l'API
        axios.get('')
            .then(response => {
                setSet(response.data);
            })
            .catch(error => {
                console.error('Fetch failed', error);
            });
    }, []);

    return (
        <div className='set-complet'>
            <h1 className='titre-setcomplet'>Set le plus complet:</h1>
            {set ? (
                <p className='set-complet-info'>
                    {set.name} - {set.total} cartes
                </p>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default AffichageSetComplet;