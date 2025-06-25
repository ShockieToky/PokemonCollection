import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Helper to determine perPage based on screen size
const getPerPage = () => {
    if (window.innerWidth < 600) return 6;      // mobile
    if (window.innerWidth < 1024) return 10;    // tablette
    return 16;                                   // bureau
};

const AffichageCartesCollection = ({ searchFilters }) => {
    const [collectionCards, setCollectionCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(getPerPage());

    // Mise à jour de perPage lors du redimensionnement de la fenêtre
    useEffect(() => {
        const handleResize = () => setPerPage(getPerPage());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Récupération des cartes de la collection avec les filtres et la pagination
        let query = `http://localhost:8000/api/cards/collection?page=${currentPage}&perPage=${perPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`;
        if (searchFilters.set) query += `&set=${searchFilters.set}`;
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;

        axios.get(query)
            .then(response => {
                setCollectionCards(response.data.data || []);
                setTotalPages(response.data.last_page || 1);
            })
            .catch(error => {
                console.error('Error lors de la récupération de la collection:', error);
                setCollectionCards([]);
            });
    }, [currentPage, searchFilters, perPage]);

    // Fonction pour aller à la page précédente
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Fonction pour aller à la page suivante
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Fonction pour retirer une carte de la collection
    const handleRemoveFromCollection = (cardId) => {
        axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-collection`)
            .then(() => {
                if (window.confirm("Voulez-vous ajouter cette carte à la wishlist ?")) {
                    axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`)
                        .then(() => {
                            // Mise à jour de l'état de la collection après suppression et ajout à la wishlist
                            refreshCards();
                        });
                } else {
                    // Mise à jour de l'état de la collection après suppression
                    refreshCards();
                }
            });
    };

    // Fonction pour rafraîchir les cartes de la collection après une action
    const refreshCards = () => {
        let query = `http://localhost:8000/api/cards/collection?page=${currentPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`; // Ajouter le nom du Pokémon si filtré
        if (searchFilters.set) query += `&set=${searchFilters.set}`; // Ajouter le set si filtré
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`; // Ajouter la rareté si filtré
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`; // Ajouter l'option de tri si filtré
        axios.get(query)
            .then(response => {
                setCollectionCards(response.data.data || []); // Mettre à jour les cartes de la collection
                setTotalPages(response.data.last_page || 1); // Mettre à jour le nombre total de pages
            });
    };

    return (
        <div>
            <h1>Cartes dans la Collection :</h1>
            {collectionCards.length > 0 ? (
                <div>
                    {/* Affichage des cartes de la collection */}
                    <div className='collection-card'>
                        {collectionCards.map((card) => (
                            <div className="affichage-cartes-collection-card" key={card.id}>
                                <img
                                    className='image-collection'
                                    src={card.images_large}
                                    alt={card.name}
                                />
                                <p>{card.name}</p>
                                {/* Supprimer de la collection */}
                                <button className='bouton-collection' onClick={() => handleRemoveFromCollection(card.id)}>
                                    ❌ collection
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* Controle de la pagination */}
                    <div className='pagination-collection'>
                        <button
                            className='bouton-pagination'
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            style={{ marginRight: '10px' }}
                        >
                            Précédent
                        </button>
                        <span>Page {currentPage} sur {totalPages}</span>
                        <button
                            className='bouton-pagination'
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