import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/accueil.css';

const AffichageNombresCartes = () => {
    const [totalCards, setTotalCards] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/cards/collection/count')
            .then(response => {
                setTotalCards(response.data.total);
            })
            .catch(error => {
                console.error('Error fetching the total number of cards:', error);
            });
    }, []);

    return (
        <div className='nombres-cartes'>
            <h1 className='titre-nbcartes'>Nombre cartes </h1>
            {totalCards !== null ? (
                <p className='total-cartes'>{totalCards} cartes</p>
            ) : (
                <p>0 cartes</p>
            )}
        </div>
    );
};

export default AffichageNombresCartes;