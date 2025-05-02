import React from 'react';
import axios from 'axios';

const AjoutCollectionWishlist = ({ cardId }) => {
    const handleAddToCollection = () => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`)
            .then(response => {
                alert('Carte ajoutée à la collection avec succès!');
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout à la collection:', error);
            });
    };

    const handleAddToWishlist = () => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`)
            .then(response => {
                alert('Carte ajoutée à la wishlist avec succès!');
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout à la wishlist:', error);
            });
    };

    return (
        <div>
            <button onClick={handleAddToCollection}>Ajouter à la collection</button>
            <button onClick={handleAddToWishlist}>Ajouter à la wishlist</button>
        </div>
    );
};

export default AjoutCollectionWishlist;