import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageCartesWishlist = ({ searchFilters }) => {
    const [wishlistCards, setWishlistCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [successMsg, setSuccessMsg] = useState('');
    const [popupCard, setPopupCard] = useState(null);

    useEffect(() => {
        // Récupération des cartes de la wishlist avec les filtres et la pagination
        let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`;
        if (searchFilters.set) query += `&set=${searchFilters.set}`;
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;

        axios.get(query)
            .then(response => {
                setWishlistCards(response.data.data); // pagination faite par le backend
                setTotalPages(response.data.last_page); // nombre total de pages
            })
            .catch(error => {
                console.error('Error fetching wishlist cards:', error);
            });
    }, [currentPage, searchFilters]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Fonction pour fermer la popup
    const closePopup = () => setPopupCard(null);

    // Fonction pour ajouter une carte à la collection depuis la wishlist
    const handleAddToCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`)
            .then(() => {
                setSuccessMsg('Carte ajoutée à la collection !');
                // Enlève la carte de la wishlist après l'ajout à la collection
                axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`)
                    .then(() => {
                        // Rafraîchit la wishlist
                        let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}`;
                        if (searchFilters.name) query += `&name=${searchFilters.name}`;
                        if (searchFilters.set) query += `&set=${searchFilters.set}`;
                        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
                        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;
                        axios.get(query)
                            .then(response => {
                                setWishlistCards(response.data.data);
                                setTotalPages(response.data.last_page);
                            });
                    })
                    .catch(() => {
                        // Si l'enlèvement de la wishlist échoue, on affiche un message d'erreur
                        setSuccessMsg('Erreur lors du retrait de la wishlist.');
                    });
            })
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la collection.'));
    };

    // Fonction pour retirer une carte de la wishlist
    const handleRemoveFromWishlist = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`)
            .then(() => {
                setSuccessMsg('Carte retirée de la wishlist !');
                // Rafraîchit la wishlist après le retrait
                let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}`;
                if (searchFilters.name) query += `&name=${searchFilters.name}`;
                if (searchFilters.set) query += `&set=${searchFilters.set}`;
                if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
                if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;
                axios.get(query)
                    .then(response => {
                        setWishlistCards(response.data.data);
                        setTotalPages(response.data.last_page);
                    });
            })
            .catch(() => setSuccessMsg('Erreur lors du retrait de la wishlist.'));
    };

    return (
        <div>
            {/* Affichage des cartes de la wishlist */}
            {wishlistCards.length > 0 ? (
                <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {wishlistCards.map((card) => (
                            <div
                                key={card.id}
                                className="affichage-cartes-wishlist-card"
                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                onClick={() => setPopupCard(card)} // Ouvre la popup avec les détails de la carte
                            >
                                <img
                                    src={card.images_large}
                                    alt={card.name}
                                    style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
                                />
                                <div style={{ marginTop: '8px' }}>
                                    <button
                                        className='bouton-wishlist'
                                        onClick={e => { e.stopPropagation(); handleAddToCollection(card.id); }} // Ajoute la carte à la collection
                                        style={{ marginRight: '8px' }}
                                    >
                                        ✅ collection
                                    </button>
                                    <button
                                        className='bouton-wishlist'
                                        onClick={e => { e.stopPropagation(); handleRemoveFromWishlist(card.id); }} // Retire la carte de la wishlist
                                    >
                                        ❌ wishlist
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Gestion de la popup */}
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
                            onClick={closePopup} // Ferme la popup en cliquant en dehors de la carte
                        >
                            <div
                                style={{
                                    padding: 20,
                                    borderRadius: 10,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    position: 'relative'
                                }}
                                onClick={e => e.stopPropagation()} // Empêche la fermeture de la popup en cliquant sur la carte
                            >
                                <img
                                    src={popupCard.images_large}
                                    alt={popupCard.name}
                                    style={{ width: '350px', height: 'auto', borderRadius: '8px' }}
                                />
                                <p style={{ textAlign: 'center', margin: '10px 0 0 0', color: 'white', fontWeight: 'bold' }}>{popupCard.name}</p>
                                <button
                                    onClick={closePopup} // Ferme la popup
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
                    {/* Gestion de la pagination */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            style={{ marginRight: '10px' }}
                        >
                            Précédent
                        </button>
                        <span>Page {currentPage} sur {totalPages}</span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            style={{ marginLeft: '10px' }}
                        >
                            Suivant
                        </button>
                    </div>
                    {/* Affichage des messages de succès */}
                    {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

export default AffichageCartesWishlist;