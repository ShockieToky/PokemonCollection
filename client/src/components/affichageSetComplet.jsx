import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        <div>
            <h1>Set le plus complet:</h1>
            {set ? (
                <p>
                    {set.name} - {set.total} cartes
                </p>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default AffichageSetComplet;