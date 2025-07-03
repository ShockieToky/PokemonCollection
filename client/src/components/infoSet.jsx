import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/set.css';

const InfoSet = ({ onSearchResults }) => {
    const [sets, setSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [setLogo, setSetLogo] = useState('');
    const [setStats, setSetStats] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [rarityStats, setRarityStats] = useState([]);
    const [globalStats, setGlobalStats] = useState(null);
    const [globalRarityStats, setGlobalRarityStats] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/sets')
            .then(response => setSets(response.data))
            .catch(error => console.error('Erreur lors de la récupération:', error));
    }, []);

    // Récupération des statistiques globales si aucun set n'est sélectionné
    useEffect(() => {
        if (!selectedSet) {
            axios.get('http://localhost:8000/api/cards/global-stats')
                .then(response => setGlobalStats(response.data))
                .catch(() => setGlobalStats(null));

            axios.get('http://localhost:8000/api/cards/global-obtained-by-rarity')
                .then(response => setGlobalRarityStats(response.data || []))
                .catch(() => setGlobalRarityStats([]));
        }
    }, [selectedSet]);

    // Mise à jour des informations du set sélectionné
    useEffect(() => {
        if (selectedSet) {
            const foundSet = sets.find(set => set.id === selectedSet || set.id === Number(selectedSet));
            setSetLogo(foundSet ? foundSet.symbol_images : '');

            axios.get(`http://localhost:8000/api/sets/${selectedSet}/stats`)
                .then(response => setSetStats(response.data))
                .catch(() => setSetStats(null));

            axios.get(`http://localhost:8000/api/sets/${selectedSet}/wishlist-count`)
                .then(response => setWishlistCount(response.data.count || 0))
                .catch(() => setWishlistCount(0));

            axios.get(`http://localhost:8000/api/sets/${selectedSet}/obtained-by-rarity`)
                .then(response => setRarityStats(response.data || []))
                .catch(() => setRarityStats([]));
        } else {
            setSetLogo('');
            setSetStats(null);
            setWishlistCount(0);
            setRarityStats([]);
        }
        // Notifier les résultats de recherche
        if (onSearchResults) {
            onSearchResults({ set: selectedSet });
        }
    }, [selectedSet, sets, onSearchResults]);

    return (
        <div>
            <h2>Informations des sets</h2>
            <div>
                <label htmlFor="set-select">Choisir un set :</label>
                <select
                    id="set-select"
                    value={selectedSet}
                    onChange={e => setSelectedSet(e.target.value)}
                >
                    <option value="">-- Choisir un set --</option>
                    {sets.map(set => (
                        <option key={set.id} value={set.id}>
                            {set.name}
                        </option>
                    ))}
                </select>
            </div>
            {/* Global stats if no set selected */}
            {!selectedSet && globalStats && (
                <div style={{ marginTop: '20px' }}>
                    <p>
                        % de cartes obtenues : <b>{globalStats.percent_completed}%</b>
                    </p>
                    <div style={{
                        background: '#eee',
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '200px',
                        height: '10px',
                    }}>
                        <div style={{
                            background: '#4caf50',
                            width: `${globalStats.percent_completed}%`,
                            height: '100%',
                            borderRadius: '8px'
                        }} />
                    </div>
                    <p>Cartes obtenues : <b>{globalStats.cards_obtained}</b></p>
                    <p>Cartes non obtenues : <b>{globalStats.cards_not_obtained}</b></p>
                    {globalRarityStats.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                            <h4>Cartes obtenues par rareté :</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {globalRarityStats.map(rarity => (
                                    <li key={rarity.rarity}>
                                        <b>{rarity.rarity || 'Inconnue'} :</b> {rarity.obtained} / {rarity.total}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            {/* Set-specific stats if set selected */}
            {setLogo && (
                <div style={{ marginTop: '20px' }}>
                    <img src={setLogo} alt="Logo du set" style={{ maxWidth: '200px', height: 'auto' }} />
                </div>
            )}
            {setStats && (
                <div style={{ marginTop: '20px' }}>
                    <p>
                        % du set complété : <b>{setStats.percent_completed}%</b>
                    </p>
                    <div style={{
                        background: '#eee',
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '200px',
                        height: '10px',
                    }}>
                        <div style={{
                            background: '#4caf50',
                            width: `${setStats.percent_completed}%`,
                            height: '100%',
                            borderRadius: '8px'
                        }} />
                    </div>
                    <p>Cartes obtenues : <b>{setStats.cards_obtained}</b></p>
                    <p>Cartes non obtenues : <b>{setStats.cards_not_obtained}</b></p>
                    <p>Cartes dans la wishlist : <b>{wishlistCount}</b></p>
                    {rarityStats.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                            <h4>Cartes obtenues par rareté :</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {rarityStats.map(rarity => (
                                    <li key={rarity.rarity}>
                                        <b>{rarity.rarity || 'Inconnue'} :</b> {rarity.obtained} / {rarity.total}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InfoSet;