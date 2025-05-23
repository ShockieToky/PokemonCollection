import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
                setSets(response.data);
            })
            .catch(error => {
                console.error('Error fetching sets:', error);
            });
    }, []);

    // Notify parent when filters change
    useEffect(() => {
        onSearchFiltersChange({
            set: selectedSet,
            pokemon: selectedPokemon,
            rarity: selectedRarity,
        });
    }, [selectedSet, selectedPokemon, selectedRarity, onSearchFiltersChange]);

    const handleSetChange = (setId) => {
        setSelectedSet(setId);
        setSelectedPokemon(null); // Reset des pokemon
        setRarities([]); // Reset de la rareté

        // Récupération des pokemons pour le set sélectionné
        axios.get(`http://localhost:8000/api/pokemons?set_id=${setId}`)
            .then(response => {
                setPokemons(response.data);
            })
            .catch(error => {
                console.error('Error fetching pokemons:', error);
            });
    };

    const handlePokemonChange = (pokemonName) => {
        setSelectedPokemon(pokemonName);

        // Récupération des raretés pour le pokemon sélectionné
        axios.get(`http://localhost:8000/api/rarities?set_id=${selectedSet}&pokemon=${pokemonName}`)
            .then(response => {
                setRarities(response.data);
            })
            .catch(error => {
                console.error('Error fetching rarities:', error);
            });
    };

    const handleRarityChange = (rarity) => {
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