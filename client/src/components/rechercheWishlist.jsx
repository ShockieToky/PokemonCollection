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
        // Récupération des sets pour le menu déroulant
        axios.get('http://localhost:8000/api/sets')
            .then(response => {
                setSets(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des sets:', error);
            });

        // Récupération des raretés pour le menu déroulant
        axios.get('http://localhost:8000/api/rarities')
            .then(response => {
                setRarities(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération de la rareté:', error);
            });
    }, []);

    useEffect(() => {
        // Mise à jour des résultats de recherche lorsque les filtres changent
        onSearchResults({
            name: searchName,
            set: selectedSet,
            rarity: selectedRarity,
            sort: sortOption,
        });
    }, [searchName, selectedSet, selectedRarity, sortOption, onSearchResults]);

    return (
        <div>
            <h2>Recherche</h2>
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