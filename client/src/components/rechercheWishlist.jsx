import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RechercheWishlist = ({ onSearchResults }) => {
    const [searchName, setSearchName] = useState('');
    const [sets, setSets] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [selectedRarity, setSelectedRarity] = useState('');
    const [sortOption, setSortOption] = useState('');

    useEffect(() => {
        // Fetch all sets for the dropdown menu
        axios.get('http://localhost:8000/api/sets')
            .then(response => {
                setSets(response.data);
            })
            .catch(error => {
                console.error('Error fetching sets:', error);
            });

        // Fetch all rarities for the dropdown menu
        axios.get('http://localhost:8000/api/rarities')
            .then(response => {
                setRarities(response.data);
            })
            .catch(error => {
                console.error('Error fetching rarities:', error);
            });
    }, []);

    useEffect(() => {
        // Update search filters whenever inputs change
        onSearchResults({
            name: searchName,
            set: selectedSet,
            rarity: selectedRarity,
            sort: sortOption,
        });
    }, [searchName, selectedSet, selectedRarity, sortOption, onSearchResults]);

    return (
        <div>
            <h2>Recherche dans la Wishlist</h2>
            <div>
                <label>Nom du Pokémon:</label>
                <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Ex: Pikachu"
                />
            </div>
            <div>
                <label>Set:</label>
                <select
                    value={selectedSet}
                    onChange={(e) => setSelectedSet(e.target.value)}
                >
                    <option value="">-- Tous les sets --</option>
                    {sets.map((set) => (
                        <option key={set.id} value={set.id}>
                            {set.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Rareté:</label>
                <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                >
                    <option value="">-- Toutes les raretés --</option>
                    {rarities.map((rarity, index) => (
                        <option key={index} value={rarity}>
                            {rarity}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Trier par:</label>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="">-- Aucun tri --</option>
                    <option value="name-asc">Nom (A à Z)</option>
                    <option value="set-asc">Set (Ancien au Récent)</option>
                    <option value="set-desc">Set (Récent à Ancien)</option>
                </select>
            </div>
        </div>
    );
};

export default RechercheWishlist;