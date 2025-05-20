import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AjoutCollection = () => {
    const [sets, setSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [pokemons, setPokemons] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState('');
    const [rarities, setRarities] = useState([]);
    const [selectedRarity, setSelectedRarity] = useState('');
    const [card, setCard] = useState(null);
    const [success, setSuccess] = useState('');

    // Fetch all sets on mount
    useEffect(() => {
        axios.get('http://localhost:8000/api/sets')
            .then(res => setSets(res.data))
            .catch(err => console.error(err));
    }, []);

    // Fetch all pokemons for the selected set
    useEffect(() => {
        if (selectedSet) {
            axios.get(`http://localhost:8000/api/cards`, {
                params: { set: selectedSet }
            })
                .then(res => {
                    // Get unique pokemon names
                    const uniqueNames = [...new Set(res.data.map(card => card.name))];
                    setPokemons(uniqueNames);
                    setSelectedPokemon('');
                    setRarities([]);
                    setSelectedRarity('');
                    setCard(null);
                })
                .catch(err => console.error(err));
        } else {
            setPokemons([]);
            setSelectedPokemon('');
            setRarities([]);
            setSelectedRarity('');
            setCard(null);
        }
    }, [selectedSet]);

    // Fetch rarities for the selected pokemon in the set
    useEffect(() => {
        if (selectedSet && selectedPokemon) {
            axios.get(`http://localhost:8000/api/cards`, {
                params: { set: selectedSet, name: selectedPokemon }
            })
                .then(res => {
                    const uniqueRarities = [...new Set(res.data.map(card => card.rarity))];
                    setRarities(uniqueRarities);
                    setSelectedRarity('');
                    setCard(null);
                })
                .catch(err => console.error(err));
        } else {
            setRarities([]);
            setSelectedRarity('');
            setCard(null);
        }
    }, [selectedSet, selectedPokemon]);

    // Fetch the card for the selected set, pokemon, and rarity
    useEffect(() => {
        if (selectedSet && selectedPokemon && selectedRarity) {
            axios.get(`http://localhost:8000/api/cards`, {
                params: { set: selectedSet, name: selectedPokemon, rarity: selectedRarity }
            })
                .then(res => {
                    setCard(res.data[0] || null);
                })
                .catch(err => console.error(err));
        } else {
            setCard(null);
        }
    }, [selectedSet, selectedPokemon, selectedRarity]);

    // Handle marking the card as obtained
    const handleObtain = () => {
        if (card) {
            axios.post(`http://localhost:8000/api/cards/${card.id}/add-to-collection`)
                .then(() => setSuccess('Carte ajoutée à la collection !'))
                .catch(() => setSuccess('Erreur lors de l\'ajout.'));
        }
    };

    return (
        <div>
            <h2>Ajouter une carte à la collection</h2>
            <div>
                <label>Set :</label>
                <select value={selectedSet} onChange={e => setSelectedSet(e.target.value)}>
                    <option value="">-- Choisir un set --</option>
                    {sets.map(set => (
                        <option key={set.id} value={set.id}>{set.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Pokémon :</label>
                <select value={selectedPokemon} onChange={e => setSelectedPokemon(e.target.value)} disabled={!selectedSet}>
                    <option value="">-- Choisir un Pokémon --</option>
                    {pokemons.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Rareté :</label>
                <select value={selectedRarity} onChange={e => setSelectedRarity(e.target.value)} disabled={!selectedPokemon}>
                    <option value="">-- Choisir une rareté --</option>
                    {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                    ))}
                </select>
            </div>
            {card && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <img src={card.images_large} alt={card.name} style={{ width: '200px', borderRadius: '8px' }} />
                    <p>{card.name} - {card.rarity}</p>
                    <button onClick={handleObtain}>Ajouter à la collection</button>
                </div>
            )}
            {success && <p>{success}</p>}
        </div>
    );
};

export default AjoutCollection;