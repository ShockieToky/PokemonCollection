import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageRecherche = ({ searchFilters }) => {
    const [cards, setCards] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (searchFilters.set && searchFilters.pokemon && searchFilters.rarity) {
            let query = `http://localhost:8000/api/cards/search?set_id=${searchFilters.set}&pokemon=${searchFilters.pokemon}&rarity=${searchFilters.rarity}`;

            axios.get(query)
                .then(response => {
                    setCards(response.data);
                    setSuccessMsg('');
                })
                .catch(error => {
                    console.error('Error fetching cards:', error);
                    setCards([]);
                });
        } else {
            setCards([]);
            setSuccessMsg('');
        }
    }, [searchFilters]);

    const handleAddToCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`)
            .then(() => setSuccessMsg('Carte ajoutée à la collection !'))
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la collection.'));
    };

    const handleAddToWishlist = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`)
            .then(() => setSuccessMsg('Carte ajoutée à la wishlist !'))
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la wishlist.'));
    };

    return (
        <div>
            <h1>Résultats de la recherche:</h1>
            {cards.length > 0 ? (
                <div>
                    {cards.map((card) => (
                        <div key={card.id} style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img
                                src={card.images_large}
                                alt={card.name}
                                style={{ width: '250px', height: 'auto', borderRadius: '8px' }}
                            />
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={() => handleAddToCollection(card.id)} style={{ marginRight: '10px' }}>
                                    Ajouter à la collection
                                </button>
                                <button onClick={() => handleAddToWishlist(card.id)}>
                                    Ajouter à la wishlist
                                </button>
                            </div>
                        </div>
                    ))}
                    {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

export default AffichageRecherche;