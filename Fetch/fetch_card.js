// // "https://api.pokemontcg.io/v2/cards"

// /**
//  * 
//  * {
//       "id": "hgss4-1",
//       "name": "Aggron",
//       "types": [
//         "Metal"
//       ],
//       "set": {
//         "id": "hgss4",
//         "name": "HS—Triumphant",
//         "series": "HeartGold & SoulSilver",
//         "printedTotal": 102,
//         "total": 103,
//         "releaseDate": "2010/11/03",
//         "symbol": "https://images.pokemontcg.io/hgss4/symbol.png",
//       },
//       "number": "1",
//       "rarity": "Rare Holo",
//       "nationalPokedexNumbers": [306],
//       "images_small": "https://images.pokemontcg.io/hgss4/1.png",
//       "images_large": "https://images.pokemontcg.io/hgss4/1_hires.png",
//     }
//  */





// id,
// name,
// number,
// set_id,
// rarity,
// nationalPokedexNumbers,
// images_small,
// images_large






    const axios = require("axios");
    
    
    const fetchSets = async () => {
        const response = await axios.get('https://api.pokemontcg.io/v2/sets');
        const data = await response.data.data;
        console.log(data);
        

        // for (const set of sets) {
        // }
    };

    fetchSets();
    
    
    // const insertSets = async (sets) => {
    //     const connection = await pool.getConnection();
    //     try {
    //         await connection.beginTransaction();
    //         for (const set of sets) {
    //             const query = `INSERT INTO sets (
    //             id, 
    //             name,
    //             series,
    //             printedTotal,
    //             total, 
    //             releaseDate,
    //             symbol_images) 
    //             VALUES (?,?,?,?,?,?,?) 
    //             ON DUPLICATE KEY UPDATE 
    //             name=VALUES(name),
    //             series=VALUES(series),
    //             printedTotal=VALUES(printedTotal),
    //             total=VALUES(total),
    //             releaseDate=VALUES(releaseDate),
    //             symbol_images=VALUES(symbol_images)`;
    //             await connection.execute(query, [
    //                 set.id,
    //                 set.name,
    //                 set.series,
    //                 set.printedTotal,
    //                 set.total,
    //                 set.releaseDate,
    //                 set.images.symbol,
    //             ]);
    //             await connection.commit();
    //         }
    //     }
    //     catch (error) {
    //         await connection.rollback();
    //         throw error;
    //     }
    //     finally {
    //         connection.release();
    //     }
    // };
    
    




















    
//     const fetchCards = async (setId) => {
//         let page = 1;
//         let hasMorePage = true;
    
//         while (hasMorePage) {
//             const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
//                 params: {
//                     page,
//                     pageSize: 250,
//                     q: `set.id:${setId}`
//                 }
//             });
    
//             const { data, totalCount } = response.data;
//             await insertCards(data);
//             hasMorePage = page * 250 < totalCount;
//             page++;
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }
    
    
    
//     };
    
    
    // const insertCards = async (cards) => {
    //     const connection = await pool.getConnection();
    //     try {
    //         await connection.beginTransaction();
    
    //         for (const card of cards) {
    //             const query = `
    //             INSERT INTO cards (
    //             id,
    //             name,
    //             set_id,
    //             number,
    //             rarity,
    //             nationalPokedexNumbers,
    //             images_small,
    //             images_large
    //             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    //              ON DUPLICATE KEY UPDATE
    //                 name=VALUES(name),
    //                 set_id=VALUES(set_id),
    //                 number=VALUES(number),
    //                 rarity=VALUES(rarity),
    //                 nationalPokedexNumbers=VALUES(nationalPokedexNumbers),
    //                 images_small=VALUES(images_small),
    //                 images_large=VALUES(images_large)
    //             `;
    //             await connection.execute(query, [
    //                 card.id,
    //                 card.name,
    //                 card.set.id,
    //                 card.number,
    //                 card.rarity,
    //                 JSON.stringify(card.nationalPokedexNumbers),
    //                 card.images.small,
    //                 card.images.large,
    //             ]);
    
    //             if (card.types) {
    //                 for (const type of card.types) {
    //                     const id = await getOrCreate(connection, type.name);
    //                     await connection.execute(
    //                         'INSERT INTO card_types (card_id, type_id) VALUES (?,?)',
    //                         [
    //                             card.id,
    //                             id
    //                         ]
    //                     )
    //                 }
    //             }
    //             await connection.commit();
    //         }
    //     }
    //     catch (error) {
    //         await connection.rollback();
    //         throw error;
    //     }
    //     finally {
    //         connection.release();
    //     }
    // };
    
    
    
    
//     const getOrCreate = async (connection, type) => {
//         const [rows] = await connection.execute('INSERT IGNORE INTO types (name) VALUES (?)', [type]);
//         const [typeRow] = await connection.execute('SELECT id FROM types WHERE name = ?', [type]);
//         return typeRow[0].id;
//     };
    
//     const main = async () => {
//         try {
//             const sets = await fetchSets();
//             // await insertSets(sets);
//             for (const set of sets) {
//                 await fetchCards(set.id);
//             }
    
//             await pool.end();
//         } catch (error) {
//             console.error(error);
//             process.exit(1);
//         }
//     }
    
//     main();


