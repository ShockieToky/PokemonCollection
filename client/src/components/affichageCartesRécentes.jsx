import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageCartesRécentes = () => {
    const [recentCards, setRecentCards] = useState([]);

    useEffect(() => {
        // Fetch the 6 most recent cards from the Laravel backend
        axios.get('http://localhost:8000/api/cards/recent')
            .then(response => {
                setRecentCards(response.data);
            })
            .catch(error => {
                console.error('Error fetching recent cards:', error);
            });
    }, []);

    return (
        <div>
            <h1>Cartes récemment obtenues :</h1>
            {recentCards.length > 0 ? (
                <div className='cartesrecentes' style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {recentCards.map((card) => (
                        <div key={card.id} style={{ textAlign: 'center' }}>
                            <img
                                src={card.images_large}
                                alt={card.name}
                                style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default AffichageCartesRécentes;