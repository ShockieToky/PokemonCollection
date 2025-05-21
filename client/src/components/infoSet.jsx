import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InfoSet = ({ onSearchResults }) => {
    const [sets, setSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [setLogo, setSetLogo] = useState('');
    const [setStats, setSetStats] = useState(null);

    // Fetch all sets on mount
    useEffect(() => {
        axios.get('http://localhost:8000/api/sets')
            .then(response => setSets(response.data))
            .catch(error => console.error('Error fetching sets:', error));
    }, []);

    // Update logo and fetch stats when set is selected
    useEffect(() => {
        if (selectedSet) {
            const foundSet = sets.find(set => set.id === selectedSet || set.id === Number(selectedSet));
            setSetLogo(foundSet ? foundSet.symbol_images : '');

            // Fetch stats for the selected set
            axios.get(`http://localhost:8000/api/sets/${selectedSet}/stats`)
                .then(response => setSetStats(response.data))
                .catch(() => setSetStats(null));
        } else {
            setSetLogo('');
            setSetStats(null);
        }
        // Notify parent of the selected set
        if (onSearchResults) {
            onSearchResults({ set: selectedSet });
        }
    }, [selectedSet, sets, onSearchResults]);

    return (
        <div>
            <h2>Informations sur un Set</h2>
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
                    {/* Progress bar */}
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
                </div>
            )}
        </div>
    );
};

export default InfoSet;