import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageSetComplet = () => {
    const [set, setSet] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/sets/most-complete')
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
                    {set.name} <br />
                    {set.obtained_cards} / {set.total_cards} cartes obtenues<br />
                    {set.completion}% complété<br />
                    {set.remaining} cartes restantes
                </p>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default AffichageSetComplet;