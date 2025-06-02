import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageSetComplet = () => {
    // Constante pour stocker le set le plus complet
    const [set, setSet] = useState(null);

    // useEffect pour récupérer le set le plus complet depuis l'API
    useEffect(() => {
        // Requête GET pour obtenir le set le plus complet
        axios.get('http://localhost:8000/api/sets/most-complete')
            .then(response => {
                // Mise à jour de l'état avec les données du set le plus complet
                setSet(response.data);
            })
            .catch(error => {
                // Gestion des erreurs lors de la récupération des données
                console.error('Erreur de la récupération', error);
            });
    }, []);

    return (
        <div className='set-complet'>
            <h1 className='titre-setcomplet'>Set le plus complet:</h1>
            {/* Affichage des informations du set le plus complet ou d'un message de chargement */}
            {set ? (
                <p className='set-complet-info'>
                    {/* Affichage des informations du set */}
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