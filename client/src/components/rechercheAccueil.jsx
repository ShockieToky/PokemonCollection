import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Composant pour la recherche d'accueil
const RechercheAccueil = ({ onSearchFiltersChange }) => {
    const [sets, setSets] = useState([]);
    const [pokemons, setPokemons] = useState([]);
    const [rarities, setRarities] = useState([]);

    const [selectedSet, setSelectedSet] = useState(null);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [selectedRarity, setSelectedRarity] = useState('');

    useEffect(() => {
        // Récupération des sets
        axios.get('http://localhost:8000/api/sets')
            .then(response => {
                // Mise à jour de l'état avec les sets récupérés
                setSets(response.data);
            })
            .catch(error => {
                // Gestion des erreurs lors de la récupération des sets
                console.error('Erreur de la récupération des sets:', error);
            });
    }, []);

    // Mise à jour des filtres de recherche lorsque les sélections changent
    useEffect(() => {
        onSearchFiltersChange({
            set: selectedSet,
            pokemon: selectedPokemon,
            rarity: selectedRarity,
        });
    }, [selectedSet, selectedPokemon, selectedRarity, onSearchFiltersChange]);

    // Gestion des changements de sélection pour le set, le pokemon et la rareté
    const handleSetChange = (setId) => {
        setSelectedSet(setId); // Mise à jour du set sélectionné
        setSelectedPokemon(null); // Reset des pokemon
        setRarities([]); // Reset de la rareté

        // Récupération des pokemons pour le set sélectionné
        axios.get(`http://localhost:8000/api/pokemons?set_id=${setId}`)
            .then(response => {
                // Mise à jour de l'état avec les pokemons du set sélectionné
                setPokemons(response.data);
            })
            .catch(error => {
                // Gestion des erreurs lors de la récupération des pokemons
                console.error('Erreur:', error);
            });
    };

    // Gestion des changements de sélection pour le pokemon
    const handlePokemonChange = (pokemonName) => {
        setSelectedPokemon(pokemonName);

        // Récupération des raretés pour le pokemon sélectionné
        axios.get(`http://localhost:8000/api/rarities?set_id=${selectedSet}&pokemon=${pokemonName}`)
            .then(response => {
                // Mise à jour de l'état avec les raretés du pokemon sélectionné
                setRarities(response.data);
            })
            .catch(error => {
                // Gestion des erreurs lors de la récupération des raretés
                console.error('Error fetching rarities:', error);
            });
    };

    // Gestion des changements de sélection pour la rareté
    const handleRarityChange = (rarity) => {
        // Mise à jour de la rareté sélectionnée
        setSelectedRarity(rarity);
    };

    return (
        <div>
            {/* Sélection du set */}
            <div>
                <label htmlFor="set">Set:</label>
                <select
                    id="set"
                    value={selectedSet || ''}
                    onChange={(e) => handleSetChange(e.target.value)}
                >
                    <option value="">-- Choisir un set --</option>
                    {sets.map((set) => (
                        <option key={set.id} value={set.id}>
                            {set.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sélection Pokemon */}
            {selectedSet && (
                <div>
                    <label htmlFor="pokemon">Pokemon:</label>
                    <select
                        id="pokemon"
                        value={selectedPokemon || ''}
                        onChange={(e) => handlePokemonChange(e.target.value)}
                    >
                        <option value="">-- Choisir un pokemon --</option>
                        {pokemons.map((pokemon) => (
                            <option key={pokemon.name} value={pokemon.name}>
                                {pokemon.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Sélection rareté */}
            {selectedPokemon && (
                <div>
                    <label htmlFor="rarity">Rareté:</label>
                    <select
                        id="rarity"
                        value={selectedRarity}
                        onChange={e => handleRarityChange(e.target.value)}
                    >
                        <option value="">-- Choisir une rareté --</option>
                        {rarities.map((rarity) => (
                            <option key={rarity} value={rarity}>
                                {rarity}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default RechercheAccueil;