import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AjoutCollection = () => {
    const [sets, setSets] = useState([]);
    const [pokemons, setPokemons] = useState([]);
    const [rarities, setRarities] = useState([]);

    const [selectedSet, setSelectedSet] = useState('');
    const [selectedPokemon, setSelectedPokemon] = useState('');
    const [selectedRarity, setSelectedRarity] = useState('');
    const [card, setCard] = useState(null);
    const [success, setSuccess] = useState('');

    // récupération des sets au chargement du composant
    useEffect(() => {
        axios.get('http://localhost:8000/api/sets')
            .then(response => setSets(response.data))
            .catch(error => console.error('Erreur lors de la récupération des sets:', error));
    }, []);

    // Récupération des pokémons quand un set est sélectionné
    useEffect(() => {
        if (selectedSet) {
            setSelectedPokemon('');
            setRarities([]);
            setSelectedRarity('');
            setCard(null);
            axios.get(`http://localhost:8000/api/pokemons?set_id=${selectedSet}`)
                .then(response => setPokemons(response.data))
                .catch(error => console.error('Erreur lors de la récupération du pokémon:', error));
        } else {
            setPokemons([]);
            setSelectedPokemon('');
            setRarities([]);
            setSelectedRarity('');
            setCard(null);
        }
    }, [selectedSet]);

    // Récupération des raretés quand un pokémon est sélectionné
    useEffect(() => {
        if (selectedSet && selectedPokemon) {
            setSelectedRarity('');
            setCard(null);
            axios.get(`http://localhost:8000/api/rarities?set_id=${selectedSet}&pokemon=${selectedPokemon}`)
                .then(response => setRarities(response.data))
                .catch(error => console.error('Erreur lors de la récupération de la rareté:', error));
        } else {
            setRarities([]);
            setSelectedRarity('');
            setCard(null);
        }
    }, [selectedSet, selectedPokemon]);

    // Récupération de la carte quand un set, un pokémon et une rareté sont sélectionnés
    useEffect(() => {
        if (selectedSet && selectedPokemon && selectedRarity) {
            axios.get('http://localhost:8000/api/cards', {
                params: { set: selectedSet, name: selectedPokemon, rarity: selectedRarity }
            })
                .then(res => setCard(res.data[0] || null))
                .catch(err => console.error(err));
        } else {
            setCard(null);
        }
    }, [selectedSet, selectedPokemon, selectedRarity]);

    const handleObtain = () => {
        if (card) {
            axios.post(`http://localhost:8000/api/cards/${card.id}/add-to-collection`)
                .then(() => {
                    // Retirer la carte de la wishlist si elle y est
                    axios.post(`http://localhost:8000/api/cards/${card.id}/remove-from-wishlist`)
                        .then(() => setSuccess('Carte ajoutée à la collection et retirée de la wishlist !'))
                        .catch(() => setSuccess('Carte ajoutée à la collection, mais erreur lors du retrait de la wishlist.'));
                })
                .catch(() => setSuccess('Erreur lors de l\'ajout.'));
        }
    };

    const handleAddToWishlist = () => {
        if (card) {
            axios.post(`http://localhost:8000/api/cards/${card.id}/add-to-wishlist`)
                .then(() => setSuccess('Carte ajoutée à la wishlist !'))
                .catch(() => setSuccess('Erreur lors de l\'ajout à la wishlist.'));
        }
    };

    return (
        <div>
            {/* Sélection du set */}
            <div>
                <label htmlFor="set">Set :</label>
                <select
                    className='ajout-select'
                    id="set"
                    value={selectedSet}
                    onChange={e => setSelectedSet(e.target.value)}
                >
                    <option value="">-- Choisir un set --</option>
                    {sets.map(set => (
                        <option key={set.id} value={set.id}>{set.name}</option>
                    ))}
                </select>
            </div>

            {/* Sélection du Pokémon (toujours affiché, désactivé si pas de set) */}
            <div>
                <label htmlFor="pokemon">Pokémon :</label>
                <select
                    className='ajout-select'
                    id="pokemon"
                    value={selectedPokemon}
                    onChange={e => setSelectedPokemon(e.target.value)}
                    disabled={!selectedSet}
                >
                    <option value="">-- Choisir un Pokémon --</option>
                    {pokemons.map(pokemon => (
                        <option key={pokemon.name} value={pokemon.name}>
                            {pokemon.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sélection de la rareté (toujours affiché, désactivé si pas de pokemon) */}
            <div>
                <label htmlFor="rarity">Rareté :</label>
                <select
                    className='ajout-select'
                    id="rarity"
                    value={selectedRarity}
                    onChange={e => setSelectedRarity(e.target.value)}
                    disabled={!selectedPokemon}
                >
                    <option value="">-- Choisir une rareté --</option>
                    {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>
                            {rarity}
                        </option>
                    ))}
                </select>
            </div>

            {/* Affichage de la carte et boutons d'ajout */}
            {card && (
                <div className='carte-affichage'>
                    <img className='carte-image' src={card.images_large} alt={card.name} />
                    <p>{card.name} - {card.rarity}</p>
                    {card.obtained ? (
                        <p style={{ color: 'green', fontWeight: 'bold' }}>déjà dans la collection</p>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    handleObtain();
                                    setCard({ ...card, obtained: true, wishlisted: false });
                                }}
                            >
                                Ajouter à la collection
                            </button>
                            <button
                                onClick={() => {
                                    handleAddToWishlist();
                                    setCard({ ...card, wishlisted: true });
                                }}
                                style={{ marginLeft: '10px' }}
                                disabled={card.wishlisted}
                            >
                                {card.wishlisted ? 'déjà dans la wishlist' : 'Ajouter à la wishlist'}
                            </button>
                        </>
                    )}
                </div>
            )}
            {success && <p>{success}</p>}
        </div>
    );
};

export default AjoutCollection;