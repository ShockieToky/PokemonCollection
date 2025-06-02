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

// // 2. Fetch all sets from your DB (id and name)
// const fetchSetsFromDB = async () => {
//     const connection = await pool.getConnection();
//     const [rows] = await connection.query('SELECT id, name FROM sets');
//     connection.release();
//     return rows;
// };

// // 3. Fetch all sets from the API (id and name)
// const fetchApiSets = async () => {
//     const response = await axios.get('https://api.pokemontcg.io/v2/sets');
//     return response.data.data; // Array of sets
// };

// // 4. Fetch cards for a set from the API (with pagination)
// const fetchCards = async (apiSetId) => {
//     let page = 1;
//     let hasMorePage = true;
//     let allCards = [];

//     while (hasMorePage) {
//         const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
//             params: {
//                 page,
//                 pageSize: 250,
//                 q: `set.id:${apiSetId}`
//             }
//         });

//         const { data, totalCount } = response.data;
//         allCards = allCards.concat(data);
//         hasMorePage = page * 250 < totalCount;
//         page++;
//         await new Promise(resolve => setTimeout(resolve, 500)); // avoid rate limit
//     }
//     return allCards;
// };

// // 5. Insert cards into your database, mapping by local set id
// const insertCards = async (cards, localSetId) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         for (const card of cards) {
//             const query = `
//                 INSERT INTO cards (
//                     id,
//                     name,
//                     set_id,
//                     number,
//                     rarity,
//                     nationalPokedexNumbers,
//                     images_small,
//                     images_large
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//                 ON DUPLICATE KEY UPDATE
//                     name=VALUES(name),
//                     set_id=VALUES(set_id),
//                     number=VALUES(number),
//                     rarity=VALUES(rarity),
//                     nationalPokedexNumbers=VALUES(nationalPokedexNumbers),
//                     images_small=VALUES(images_small),
//                     images_large=VALUES(images_large)
//             `;
//             await connection.execute(query, [
//                 card.id,
//                 card.name,
//                 localSetId,
//                 card.number,
//                 card.rarity || '',
//                 JSON.stringify(card.nationalPokedexNumbers || []),
//                 card.images?.small || '',
//                 card.images?.large || '',
//             ]);
//         }

//         await connection.commit();
//     } catch (error) {
//         await connection.rollback();
//         throw error;
//     } finally {
//         connection.release();
//     }
// };

// // 6. Main function to run everything
// const main = async () => {
//     try {
//         // Fetch sets from DB and API
//         const dbSets = await fetchSetsFromDB();
//         const apiSets = await fetchApiSets();

//         // Build a mapping from set name to local set id
//         const setNameToId = {};
//         dbSets.forEach(set => {
//             setNameToId[set.name] = set.id;
//         });

//         for (const apiSet of apiSets) {
//             const localSetId = setNameToId[apiSet.name];
//             if (!localSetId) {
//                 console.log(`No local set found for "${apiSet.name}", skipping`);
//                 continue;
//             }
//             console.log(`Fetching cards for set: ${apiSet.name} (local id: ${localSetId})`);
//             const cards = await fetchCards(apiSet.id);
//             console.log(`Inserting ${cards.length} cards for set: ${apiSet.name}`);
//             await insertCards(cards, localSetId);
//         }
//         console.log('All cards imported successfully!');
//         await pool.end();
//     } catch (error) {
//         console.error(error);
//         process.exit(1);
//     }
// };

// main();

const axios = require("axios");
const mysql = require("mysql2/promise");

// 1. Set up MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pokemon_cards',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. Fetch types from the API
const fetchTypesFromAPI = async () => {
    const response = await axios.get('https://api.pokemontcg.io/v2/types');
    return response.data.data; // Array of type strings
};

// 3. Insert types into your database
const insertTypes = async (types) => {
    const connection = await pool.getConnection();
    try {
        for (const type of types) {
            await connection.execute(
                'INSERT IGNORE INTO types (name) VALUES (?)',
                [type]
            );
        }
    } finally {
        connection.release();
    }
};

// 4. Main function to fetch and insert types
const fetchAndStoreTypes = async () => {
    try {
        const types = await fetchTypesFromAPI();
        console.log('Types found:', types);
        await insertTypes(types);
        console.log('Types inserted into database!');
        await pool.end();
    } catch (error) {
        console.error('Error fetching or inserting types:', error);
        process.exit(1);
    }
};

fetchAndStoreTypes();