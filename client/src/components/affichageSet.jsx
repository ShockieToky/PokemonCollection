import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageSet = ({ setId }) => {
    const [cards, setCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (setId) {
            axios.get(`http://localhost:8000/api/cards?set=${setId}&page=${currentPage}`)
                .then(res => {
                    setCards(res.data.data || res.data || []);
                    setTotalPages(res.data.last_page || 1);
                })
                .catch(() => {
                    setCards([]);
                    setTotalPages(1);
                });
        }
    }, [setId, currentPage]);

    const handleAddToCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`).then(() => {
            // Remove from wishlist as well
            axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`).finally(() => {
                setCards(cards =>
                    cards.map(card =>
                        card.id === cardId
                            ? { ...card, obtained: true, wishlisted: false }
                            : card
                    )
                );
            });
        });
    };

    const handleAddToWishlist = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`).then(() => {
            setCards(cards =>
                cards.map(card =>
                    card.id === cardId
                        ? { ...card, wishlisted: true }
                        : card
                )
            );
        });
    };

    if (!setId) {
        return <div><p>Sélectionnez un set pour voir les cartes.</p></div>;
    }

    return (
        <div>
            <h3>Cartes du set</h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px',
                marginBottom: '20px'
            }}>
                {cards.map(card => (
                    <div key={card.id} style={{ textAlign: 'center', background: '#fff', borderRadius: '8px', padding: '10px' }}>
                        <img
                            src={card.images?.large || card.images_large || card.image_url || 'https://via.placeholder.com/120x170?text=No+Image'}
                            alt={card.name}
                            style={{ width: '120px', borderRadius: '6px' }}
                        />
                        <p>{card.name}</p>
                        {card.obtained ? (
                            <p style={{ color: 'green', fontWeight: 'bold' }}>déjà dans la collection</p>
                        ) : (
                            <>
                                <button onClick={() => handleAddToCollection(card.id)} style={{ marginRight: '8px' }}>
                                    Ajouter à la collection
                                </button>
                                {card.wishlisted ? (
                                    <button disabled style={{ background: '#ccc', color: '#666' }}>
                                        déjà dans la wishlist
                                    </button>
                                ) : (
                                    <button onClick={() => handleAddToWishlist(card.id)}>
                                        Ajouter à la wishlist
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            {/* Pagination */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ marginRight: '10px' }}
                >
                    Précédent
                </button>
                <span>Page {currentPage} sur {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ marginLeft: '10px' }}
                >
                    Suivant
                </button>
            </div>
        </div>
    );
};

export default AffichageSet;