import React, { useEffect, useState } from 'react';
import axios from 'axios';

const getPerPage = () => {
    if (window.innerWidth < 600) return 3;      // mobile
    if (window.innerWidth < 1024) return 4;     // tablette
    return 21;                                    // bureau
};

const AffichageCartesWishlist = ({ searchFilters }) => {
    const [wishlistCards, setWishlistCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [successMsg, setSuccessMsg] = useState('');
    const [popupCard, setPopupCard] = useState(null);
    const [perPage, setPerPage] = useState(getPerPage());

    // Update perPage on resize
    useEffect(() => {
        const handleResize = () => setPerPage(getPerPage());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Récupération des cartes de la wishlist avec les filtres et la pagination
        let query = `http://localhost:8000/api/cards/wishlist?page=${currentPage}&perPage=${perPage}`;
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
                console.error('Erreur lors de la récupération des cartes:', error);
            });
    }, [currentPage, searchFilters, perPage]);

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
                    <div className='wishlist-card'>
                        {wishlistCards.map((card) => (
                            <div
                                key={card.id}
                                className="affichage-cartes-wishlist-card"
                                onClick={() => setPopupCard(card)} // Ouvre la popup avec les détails de la carte
                            >
                                <img
                                    src={card.images_large}
                                    alt={card.name}
                                    className='popup-card'
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
                        <div className='gestion-popup'
                            onClick={closePopup} // Ferme la popup en cliquant en dehors de la carte
                        >
                            <div className='popup-card-details'
                                onClick={e => e.stopPropagation()} // Empêche la fermeture de la popup en cliquant sur la carte
                            >
                                <img
                                    className='image-popup'
                                    src={popupCard.images_large}
                                    alt={popupCard.name}
                                />
                            </div>
                        </div>
                    )}
                    {/* Gestion de la pagination */}
                    <div className='pagination'>
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