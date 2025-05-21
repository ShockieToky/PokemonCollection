import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageCartesCollection = ({ searchFilters }) => {
    const [collectionCards, setCollectionCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        // Fetch obtained cards with pagination and search filters
        let query = `http://localhost:8000/api/cards/collection?page=${currentPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`;
        if (searchFilters.set) query += `&set=${searchFilters.set}`;
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;

        axios.get(query)
            .then(response => {
                setCollectionCards(response.data.data || []); // fallback to empty array
                setTotalPages(response.data.last_page || 1);
            })
            .catch(error => {
                console.error('Error fetching collection cards:', error);
                setCollectionCards([]); // also fallback on error
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

    const handleRemoveFromCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-collection`)
            .then(() => {
                if (window.confirm("Voulez-vous ajouter cette carte à la wishlist ?")) {
                    axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`)
                        .then(() => {
                            // Optionally show a message
                            // Refresh cards
                            refreshCards();
                        });
                } else {
                    // Refresh cards
                    refreshCards();
                }
            });
    };

    const refreshCards = () => {
        let query = `http://localhost:8000/api/cards/collection?page=${currentPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`;
        if (searchFilters.set) query += `&set=${searchFilters.set}`;
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;
        axios.get(query)
            .then(response => {
                setCollectionCards(response.data.data || []);
                setTotalPages(response.data.last_page || 1);
            });
    };

    return (
        <div>
            <h1>Cartes dans la Collection :</h1>
            {collectionCards.length > 0 ? (
                <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {collectionCards.map((card) => (
                            <div key={card.id} style={{ textAlign: 'center' }}>
                                <img
                                    src={card.images_large}
                                    alt={card.name}
                                    style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
                                />
                                <p>{card.name}</p>
                                <button onClick={() => handleRemoveFromCollection(card.id)}>
                                    Retirer de la collection
                                </button>
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
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

export default AffichageCartesCollection;