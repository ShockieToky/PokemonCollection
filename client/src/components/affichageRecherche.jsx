import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AffichageRecherche = ({ selectedSet, selectedPokemon, selectedRarity }) => {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        // Fetch cards based on the search criteria
        if (selectedSet) {
            let query = `http://localhost:8000/api/cards/search?set_id=${selectedSet}`;
            if (selectedPokemon) {
                query += `&pokemon=${selectedPokemon}`;
            }
            if (selectedRarity) {
                query += `&rarity=${selectedRarity}`;
            }

            axios.get(query)
                .then(response => {
                    setCards(response.data);
                })
                .catch(error => {
                    console.error('Error fetching cards:', error);
                });
        }
    }, [selectedSet, selectedPokemon, selectedRarity]);

    return (
        <div>
            <h1>Résultats de la recherche:</h1>
            {cards.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {cards.map((card) => (
                        <div key={card.id} style={{ textAlign: 'center' }}>
                            <img
                                src={card.images_large}
                                alt={card.name}
                                style={{ width: '150px', height: 'auto', borderRadius: '8px' }}
                            />
                            <p>{card.name}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Aucune carte trouvée.</p>
            )}
        </div>
    );
};

{/* <AffichageRecherche
    selectedSet={selectedSet}
    selectedPokemon={selectedPokemon}
    selectedRarity={selectedRarity}
/> */}

export default AffichageRecherche;