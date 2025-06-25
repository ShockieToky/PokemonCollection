import React from 'react';
import { useNavigate } from 'react-router-dom';
import AjoutCollection from '../components/ajoutCollection';
import '../styles/ajoutCarte.css';

const AjoutCarte = () => {
    const navigate = useNavigate();

    return (
        <div className='ajoutCarte'>
            <h1>Ajouter une carte</h1>
            <AjoutCollection />
            <button onClick={() => navigate('/')}>
                Retour à l'accueil
            </button>
        </div>
    );
}

export default AjoutCarte;