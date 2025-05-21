import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageRecherche = ({ searchFilters }) => {
    const [cards, setCards] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (searchFilters.set && searchFilters.pokemon && searchFilters.rarity) {
            let query = `http://localhost:8000/api/cards/search?set_id=${searchFilters.set}&pokemon=${searchFilters.pokemon}&rarity=${searchFilters.rarity}`;

            axios.get(query)
                .then(response => {
                    setCards(response.data);
                    setSuccessMsg('');
                    setCurrentIndex(0); // Reset to first card on new search
                })
                .catch(error => {
                    console.error('Error fetching cards:', error);
                    setCards([]);
                });
        } else {
            setCards([]);
            setSuccessMsg('');
            setCurrentIndex(0);
        }
    }, [searchFilters]);

    const handleAddToCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`)
            .then(() => {
                setSuccessMsg('Carte ajoutée à la collection !');
                // Remove wishlisted status if present
                axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`)
                    .then(() => {
                        // Optionally update UI or show another message
                    })
                    .catch(() => {
                        // Optionally handle error silently
                    });
            })
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la collection.'));
    };

    const handleAddToWishlist = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`)
            .then(() => setSuccessMsg('Carte ajoutée à la wishlist !'))
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la wishlist.'));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    };

    return (
        <div>
            <h1>Résultats de la recherche:</h1>
            {cards.length > 0 ? (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img
                        src={cards[currentIndex].images_large}
                        alt={cards[currentIndex].name}
                        style={{ width: '250px', height: 'auto', borderRadius: '8px' }}
                    />
                    <div style={{ marginTop: '10px' }}>
                        <button onClick={() => handleAddToCollection(cards[currentIndex].id)} style={{ marginRight: '10px' }}>
                            Ajouter à la collection
                        </button>
                        <button onClick={() => handleAddToWishlist(cards[currentIndex].id)}>
                            Ajouter à la wishlist
                        </button>
                    </div>
                    {cards.length > 1 && (
                        <div style={{ marginTop: '15px' }}>
                            <button onClick={handlePrev} style={{ marginRight: '10px' }}>{'←'}</button>
                            <span>{currentIndex + 1} / {cards.length}</span>
                            <button onClick={handleNext} style={{ marginLeft: '10px' }}>{'→'}</button>
                        </div>
                    )}
                    {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

export default AffichageRecherche;