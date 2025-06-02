import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageNombresCartes = () => {
    // constante pour stocker le nombre total de cartes
    const [totalCards, setTotalCards] = useState(null);

    // useEffect pour récupérer le nombre total de cartes depuis l'API
    useEffect(() => {
        // Requête GET pour obtenir le nombre total de cartes
        axios.get('http://localhost:8000/api/cards/collection/count')
            .then(response => {
                // Mise à jour de l'état avec le nombre total de cartes
                setTotalCards(response.data.total);
            })
            .catch(error => {
                // Gestion des erreurs lors de la récupération des données
                console.error('Erreur lors de la récupération du nombres de cartes', error);
            });
    }, []);

    return (
        <div className='nombres-cartes'>
            <h1 className='titre-nbcartes'>Nombre cartes </h1>
            {/* Affichage du nombre total de cartes ou d'un message par défaut */}
            {totalCards !== null ? (
                <p className='total-cartes'>{totalCards} cartes</p>
            ) : (
                <p>0 cartes</p>
            )}
        </div>
    );
};

export default AffichageNombresCartes;