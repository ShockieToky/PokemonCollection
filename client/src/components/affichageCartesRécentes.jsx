import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageCartesRécentes = () => {
    // Constante pour stocker les cartes récemment obtenues
    const [recentCards, setRecentCards] = useState([]);

    // useEffect pour récupérer les cartes récemment obtenues depuis l'API
    useEffect(() => {
        // Requête GET pour obtenir les cartes récemment obtenues
        axios.get('http://localhost:8000/api/cards/recent')
            .then(response => {
                // Mise à jour de l'état avec les cartes récemment obtenues
                setRecentCards(response.data);
            })
            .catch(error => {
                // Gestion des erreurs lors de la récupération des données
                console.error('Error lors de la récupération de la carte', error);
            });
    }, []);

    return (
        <div>
            <h1>Cartes récemment obtenues :</h1>
            {/* Affichage des cartes récemment obtenues */}
            {recentCards.length > 0 ? (
                // Affichage des cartes dans une grille
                < div className='cartesrecentes'>
                    {/* Parcours des cartes et affichage de chaque carte */}
                    {recentCards.map((card) => (
                        // Affichage de chaque carte avec son image ou son nom
                        <div className='bloc-cartes' key={card.id}>
                            <img
                                className='image-carte'
                                src={card.images_large}
                                alt={card.name}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>Chargement...</p>
            )
            }
        </div >
    );
};

export default AffichageCartesRécentes;