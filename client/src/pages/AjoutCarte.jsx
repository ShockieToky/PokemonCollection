import React from 'react';
import AjoutCollection from '../components/ajoutCollection';
import '../styles/ajoutCarte.css';

const AjoutCarte = () => {
    return (
        <div className='ajoutCarte'>
            <h1>Ajouter une carte</h1>
            <AjoutCollection />
        </div>
    );
}