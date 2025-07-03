import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/set.css';

const AffichageSet = ({ setId }) => {
    const [cards, setCards] = useState([]);
    const [popupCard, setPopupCard] = useState(null);

    useEffect(() => {
        if (setId) {
            axios.get(`http://localhost:8000/api/cards?set=${setId}`)
                .then(res => {
                    setCards(res.data.data || res.data || []);
                })
                .catch(() => {
                    setCards([]);
                });
        }
    }, [setId]);

    const handleAddToCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`).then(() => {
            // Retire la carte de la wishlist si elle y est
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

    const closePopup = () => setPopupCard(null);

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
                    <div
                        className='card-item'
                        key={card.id}
                        onClick={() => setPopupCard(card)}
                    >
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
                                <button
                                    onClick={e => { e.stopPropagation(); handleAddToCollection(card.id); }}
                                    style={{ marginRight: '8px' }}
                                >
                                    Ajouter à la collection
                                </button>
                                {card.wishlisted ? (
                                    <button disabled style={{ background: '#ccc', color: '#666' }}>
                                        déjà dans la wishlist
                                    </button>
                                ) : (
                                    <button
                                        onClick={e => { e.stopPropagation(); handleAddToWishlist(card.id); }}
                                    >
                                        Ajouter à la wishlist
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            {/* Popup Modal */}
            {popupCard && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={closePopup}
                >
                    <div
                        style={{
                            padding: 20,
                            borderRadius: 10,
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={popupCard.images?.large || popupCard.images_large || popupCard.image_url || 'https://via.placeholder.com/350x500?text=No+Image'}
                            alt={popupCard.name}
                            style={{ width: '350px', height: 'auto', borderRadius: '8px' }}
                        />
                        <p style={{ textAlign: 'center', margin: '10px 0 0 0', color: 'white', fontWeight: 'bold' }}>{popupCard.name}</p>
                        <button
                            onClick={closePopup}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: '#eee',
                                border: 'none',
                                borderRadius: '50%',
                                width: 30,
                                height: 30,
                                fontSize: 18,
                                cursor: 'pointer'
                            }}
                        >×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AffichageSet;