import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageRecherche = ({ searchFilters }) => {
    // Constantes pour stocker les cartes, le message de succès et l'index actuel
    const [cards, setCards] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    // useEffect pour récupérer les cartes en fonction des filtres de recherche
    useEffect(() => {
        // Vérification que les filtres de recherche sont définis via searchFilters
        if (searchFilters.set && searchFilters.pokemon && searchFilters.rarity) {
            // Construction de la requête pour récupérer les cartes
            let query = `http://localhost:8000/api/cards/search?set_id=${searchFilters.set}&pokemon=${searchFilters.pokemon}&rarity=${searchFilters.rarity}`;

            // Requête GET pour obtenir les cartes en fonction des filtres
            axios.get(query)
                .then(response => {
                    // Mise à jour de l'état avec les cartes récupérées
                    setCards(response.data);
                    setSuccessMsg('');
                    setCurrentIndex(0); // Réinitialisation de l'index actuel
                })
                .catch(error => {
                    // Gestion des erreurs lors de la récupération des cartes
                    console.error('Error lors de la récupération des cartes', error);
                    setCards([]);
                });
        } else {
            // Si les filtres ne sont pas définis, réinitialisation des cartes et du message de succès
            setCards([]);
            setSuccessMsg('');
            setCurrentIndex(0);
        }
    }, [searchFilters]);

    // Fonctions pour gérer l'ajout à la collection
    const handleAddToCollection = (cardId) => {
        // Requête POST pour ajouter la carte à la collection
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-collection`)
            .then(() => {
                setSuccessMsg('Carte ajoutée à la collection !');
                // Requête POST pour retirer la carte de la wishlist si elle y est présente
                axios.post(`http://localhost:8000/api/cards/${cardId}/remove-from-wishlist`)
                    .then(() => {
                        // Message de succès pour la suppression de la wishlist
                        console.log('Carte retirée de la wishlist avec succès');
                    })
                    .catch(() => {
                        // Gestion des erreurs lors de la suppression de la wishlist
                        console.error('Erreur lors de la suppression de la carte de la wishlist');
                    });
            })
            // Gestion des erreurs lors de l'ajout à la collection
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la collection.'));
    };

    // Fonction pour gérer l'ajout à la wishlist
    const handleAddToWishlist = (cardId) => {
        // Requête POST pour ajouter la carte à la wishlist
        axios.post(`http://localhost:8000/api/cards/${cardId}/add-to-wishlist`)
            // Mise à jour du message de succès après l'ajout à la wishlist
            .then(() => setSuccessMsg('Carte ajoutée à la wishlist !'))
            // Gestion des erreurs lors de l'ajout à la wishlist
            .catch(() => setSuccessMsg('Erreur lors de l\'ajout à la wishlist.'));
    };

    // Fonctions pour naviguer entre les cartes
    const handlePrev = () => {
        // Mise à jour de l'index actuel pour afficher la carte précédente
        setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    };

    const handleNext = () => {
        // Mise à jour de l'index actuel pour afficher la carte suivante
        setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    };

    return (
        <div>
            <h1>Recherche</h1>
            {/* Affichage des cartes en fonction des filtres de recherche */}
            {cards.length > 0 ? (
                // Affichage de la carte actuelle avec ses actions
                <div className='carte-recherche'>
                    <img
                        className='image-recherche'
                        src={cards[currentIndex].images_large}
                        alt={cards[currentIndex].name}
                    />
                    <div>
                        {/* Affichage du nom de la carte et de ses détails */}
                        {cards[currentIndex].obtained ? (
                            // Si la carte est obtenue, affiche le message de sa présence dans la collection
                            <p style={{ color: 'green', fontWeight: 'bold' }}>déjà dans la collection</p>
                        ) : (
                            <>
                                {/* Button pour ajouter dans la collection*/}
                                <button
                                    className='bouton-recherche'
                                    onClick={() => handleAddToCollection(cards[currentIndex].id)}
                                >
                                    ✅ collection
                                </button>
                                {/* Button pour ajouter dans la wishlist*/}
                                <button
                                    className='bouton-recherche'
                                    onClick={() => handleAddToWishlist(cards[currentIndex].id)}
                                    // Si la carte est déjà wishlisted, le bouton est désactivé
                                    disabled={cards[currentIndex].wishlisted}
                                >
                                    {/* Si la carte est déjà dans la wishlist, affiche un message différent */}
                                    {cards[currentIndex].wishlisted ? 'déjà dans la wishlist' : '❤ wishlist'}
                                </button>
                            </>
                        )}
                    </div>
                    {/* Si plusieurs cartes sont trouvées, affiche les boutons de navigation */}
                    {cards.length > 1 && (
                        <div style={{ marginTop: '15px' }}>
                            <button onClick={handlePrev} style={{ marginRight: '10px' }}>{'←'}</button>
                            <span>{currentIndex + 1} / {cards.length}</span>
                            <button onClick={handleNext} style={{ marginLeft: '10px' }}>{'→'}</button>
                        </div>
                    )}
                    {successMsg && <p style={{ color: 'green', fontWeight: 'bold' }}>{successMsg}</p>}
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

export default AffichageRecherche;