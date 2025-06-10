import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Composant pour afficher les cartes de la collection avec pagination et filtres
const AffichageCartesCollection = ({ searchFilters }) => {
    const [collectionCards, setCollectionCards] = useState([]); // État pour stocker les cartes de la collection
    const [currentPage, setCurrentPage] = useState(1); // État pour la page actuelle de la pagination
    const [totalPages, setTotalPages] = useState(1); // État pour le nombre total de pages

    useEffect(() => {
        // Récupération des cartes de la collection avec les filtres et la pagination
        let query = `http://localhost:8000/api/cards/collection?page=${currentPage}`;
        if (searchFilters.name) query += `&name=${searchFilters.name}`;
        if (searchFilters.set) query += `&set=${searchFilters.set}`;
        if (searchFilters.rarity) query += `&rarity=${searchFilters.rarity}`;
        if (searchFilters.sort) query += `&sort=${searchFilters.sort}`;

        axios.get(query)
            .then(response => {
                setCollectionCards(response.data.data || []); // tableau vide si pas de données
                setTotalPages(response.data.last_page || 1); // 1 page par défaut si pas de données
            })
            .catch(error => {
                console.error('Error fetching collection cards:', error);
                setCollectionCards([]); // vider le tableau en cas d'erreur
            });
    }, [currentPage, searchFilters]);

    // Fonction pour aller à la page précédente
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1); // Décrémenter la page actuelle si ce n'est pas la première page
        }
    };

    // Fonction pour aller à la page suivante
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1); // Incrémenter la page actuelle si ce n'est pas la dernière page
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {collectionCards.map((card) => (
                            <div className="affichage-cartes-collection-card" key={card.id} style={{ textAlign: 'center' }}>
                                <img
                                    src={card.images_large}
                                    alt={card.name}
                                    style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
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