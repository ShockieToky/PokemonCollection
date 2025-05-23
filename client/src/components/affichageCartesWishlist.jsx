import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageCartesWishlist = ({ searchFilters }) => {
    const [wishlistCards, setWishlistCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        // Fetch wishlist cards with pagination and search filters
        let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`;
        if (searchFilters.set) query += `&set=${searchFilters.set}`;
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;

        axios.get(query)
            .then(response => {
                setWishlistCards(response.data.data); // Assuming Laravel's pagination returns data in `data`
                setTotalPages(response.data.last_page); // Assuming `last_page` is provided in the response
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

    const handleAddToCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`)
            .then(() => {
                setSuccessMsg('Carte ajoutée à la collection !');
                // Remove wishlisted status if present
                axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`)
                    .then(() => {
                        // Refresh the wishlist
                        let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}`;
                        if (searchFilters.name) query += `&name=${searchFilters.name}`;
                        if (searchFilters.set) query += `&set=${searchFilters.set}`;
                        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
                        axios.get(query)
                            .then(response => {
                                setWishlistCards(response.data.data);
                                setTotalPages(response.data.last_page);
                            });
                    })
                    .catch(() => {
                        // Optionally handle error silently
                    });
            })
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la collection.'));
    };

    const handleRemoveFromWishlist = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`)
            .then(() => {
                setSuccessMsg('Carte retirée de la wishlist !');
                // Refresh the wishlist
                let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}`;
                if (searchFilters.name) query += `&name=${searchFilters.name}`;
                if (searchFilters.set) query += `&set=${searchFilters.set}`;
                if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
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
            {wishlistCards.length > 0 ? (
                <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {wishlistCards.map((card) => (
                            <div key={card.id} className="affichage-cartes-wishlist-card" style={{ textAlign: 'center' }}>
                                <img
                                    src={card.images_large}
                                    alt={card.name}
                                    style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
                                />
                                <div style={{ marginTop: '8px' }}>
                                    <button className='bouton-wishlist' onClick={() => handleAddToCollection(card.id)} style={{ marginRight: '8px' }}>
                                        ✅ collection
                                    </button>
                                    <button className='bouton-wishlist' onClick={() => handleRemoveFromWishlist(card.id)}>
                                        ❌ wishlist
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination Controls */}
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
                    {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

export default AffichageCartesWishlist;