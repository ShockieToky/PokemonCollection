const axios = require("axios");
const mysql = require("mysql2/promise");

// 1. Mise en place de la connexion à la base de données MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pokemon_cards',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. Récupération des sets depuis la base de données (id et nom)
const fetchSetsFromDB = async () => {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, name FROM sets');
    connection.release();
    return rows;
};

// 3. Récupération des sets depuis l'API
const fetchApiSets = async () => {
    const response = await axios.get('https://api.pokemontcg.io/v2/sets');
    return response.data.data; // Tableau des sets
};

// 4. Récupération des cartes pour un set donné depuis l'API
const fetchCards = async (apiSetId) => {
    let page = 1;
    let hasMorePage = true;
    let allCards = [];

    while (hasMorePage) {
        const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
            params: {
                page,
                pageSize: 250,
                q: `set.id:${apiSetId}`
            }
        });

        const { data, totalCount } = response.data;
        allCards = allCards.concat(data);
        hasMorePage = page * 250 < totalCount;
        page++;
        await new Promise(resolve => setTimeout(resolve, 500)); // éviter les requêtes trop rapides
    }
    return allCards;
};

// 5. Insertion des cartes dans la base de données
const insertCards = async (cards, localSetId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const card of cards) {
            const query = `
                INSERT INTO cards (
                    id,
                    name,
                    set_id,
                    number,
                    rarity,
                    nationalPokedexNumbers,
                    images_small,
                    images_large
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name=VALUES(name),
                    set_id=VALUES(set_id),
                    number=VALUES(number),
                    rarity=VALUES(rarity),
                    nationalPokedexNumbers=VALUES(nationalPokedexNumbers),
                    images_small=VALUES(images_small),
                    images_large=VALUES(images_large)
            `;
            await connection.execute(query, [
                card.id,
                card.name,
                localSetId,
                card.number,
                card.rarity || '',
                JSON.stringify(card.nationalPokedexNumbers || []),
                card.images?.small || '',
                card.images?.large || '',
            ]);
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// 6. Fonction principale pour récupérer les sets et insérer les cartes
const main = async () => {
    try {
        // Récupération des sets depuis la base de données et l'API
        const dbSets = await fetchSetsFromDB();
        const apiSets = await fetchApiSets();

        // Construire un mapping des noms de sets de la base de données vers leurs IDs
        const setNameToId = {};
        dbSets.forEach(set => {
            setNameToId[set.name] = set.id;
        });

        for (const apiSet of apiSets) {
            const localSetId = setNameToId[apiSet.name];
            if (!localSetId) {
                console.log(`No local set found for "${apiSet.name}", skipping`);
                continue;
            }
            console.log(`Fetching cards for set: ${apiSet.name} (local id: ${localSetId})`);
            const cards = await fetchCards(apiSet.id);
            console.log(`Inserting ${cards.length} cards for set: ${apiSet.name}`);
            await insertCards(cards, localSetId);
        }
        console.log('All cards imported successfully!');
        await pool.end();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

main();

// const axios = require("axios");
// const mysql = require("mysql2/promise");

// // 1. Set up MySQL connection pool
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'pokemon_cards',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // 2. Fetch types from the API
// const fetchTypesFromAPI = async () => {
//     const response = await axios.get('https://api.pokemontcg.io/v2/types');
//     return response.data.data; // Array of type strings
// };

// // 3. Insert types into your database
// const insertTypes = async (types) => {
//     const connection = await pool.getConnection();
//     try {
//         for (const type of types) {
//             await connection.execute(
//                 'INSERT IGNORE INTO types (name) VALUES (?)',
//                 [type]
//             );
//         }
//     } finally {
//         connection.release();
//     }
// };

// // 4. Main function to fetch and insert types
// const fetchAndStoreTypes = async () => {
//     try {
//         const types = await fetchTypesFromAPI();
//         console.log('Types found:', types);
//         await insertTypes(types);
//         console.log('Types inserted into database!');
//         await pool.end();
//     } catch (error) {
//         console.error('Error fetching or inserting types:', error);
//         process.exit(1);
//     }
// };

// fetchAndStoreTypes();

// const axios = require("axios");
// const mysql = require("mysql2/promise");

// // 1. Mise en place de la connexion à la base de données MySQL
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'pokemon_cards',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // 2. Récupération des sets depuis l'API
// const fetchSetsFromAPI = async () => {
//     const response = await axios.get('https://api.pokemontcg.io/v2/sets');
//     return response.data.data; // Tableau des sets
// };

// // 3. Insertion des sets dans la base de données
// const insertSets = async (sets) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         for (const set of sets) {
//             const query = `
//             INSERT INTO sets (id, name, series, printedTotal, total, releaseDate, symbol_images)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//             ON DUPLICATE KEY UPDATE
//             name=VALUES(name),
//             series=VALUES(series),
//             printedTotal=VALUES(printedTotal),
//             total=VALUES(total),
//             releaseDate=VALUES(releaseDate),
//             symbol_images=VALUES(symbol_images)
//             `;
//             await connection.execute(query, [
//                 set.id,
//                 set.name,
//                 set.series,
//                 set.printedTotal || 0,
//                 set.total || 0,
//                 set.releaseDate || null,
//                 set.images?.symbol || null
//             ]);
//         }

//         await connection.commit();
//     } catch (error) {
//         await connection.rollback();
//         throw error;
//     } finally {
//         connection.release();
//     }
// }

// // 4. Fonction principale pour récupérer et insérer les sets
// const fetchAndStoreSets = async () => {
//     try {
//         const sets = await fetchSetsFromAPI();
//         console.log('Sets found:', sets);
//         await insertSets(sets);
//         console.log('Sets inserted into database!');
//         await pool.end();
//     } catch (error) {
//         console.error('Error fetching or inserting sets:', error);
//         process.exit(1);
//     }
// }

// fetchAndStoreSets();