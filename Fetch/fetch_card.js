import axios from "axios";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import pLimit from 'p-limit';

const CONFIG = {
    baseUrl: 'https://api.pokemontcg.io/v2',
    pageSize: 250,
    retryAttempts: 3,
    retryDelay: 2000,
    concurrency: 3,
    rateLimitDelay: 1000,
    dataDir: './data',
    stateFile: './data/fetch_state.json',
    cardsFile: './data/cards.json',
    setsFile: './data/sets.json',
};

const ensureDirectoryExists = (filePath) => {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
};

const logger = {
    info: (message) => console.log(`[${new Date().toISOString()}] INFO: ${message}`),
    error: (message) => console.error(`[${new Date().toISOString()}] ERROR: ${message}`),
    success: (message) => console.log(`[${new Date().toISOString()}] SUCCESS: ${message}`),
    progress: (message) => process.stdout.write(`\r[${new Date().toISOString()}] ${message}`)
};

const apiClient = {
    async get(endpoint, params = {}, attempts = 0) {
        try {
            const url = `${CONFIG.baseUrl}${endpoint}`;
            const response = await axios.get(url, { params });
            await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimitDelay));
            return response.data;
        } catch (error) {
            if (attempts < CONFIG.retryAttempts) {
                const delay = CONFIG.retryDelay * (attempts + 1);
                logger.error(`Request failed, retrying in ${delay}ms... (${attempts + 1}/${CONFIG.retryAttempts})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.get(endpoint, params, attempts + 1);
            }
            throw new Error(`API request failed after ${CONFIG.retryAttempts} attempts: ${error.message}`);
        }
    }
};

const stateManager = {
    saveState(sets, currentSetIndex, currentPage, cards) {
        const state = {
            setsCompleted: sets,
            currentSetIndex,
            currentPage,
            cardsCount: cards.length,
            lastUpdate: new Date().toISOString()
        };
        ensureDirectoryExists(CONFIG.stateFile);
        writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
        writeFileSync(CONFIG.cardsFile, JSON.stringify(cards, null, 2));
        logger.info(`State saved: Set index ${currentSetIndex}, Page ${currentPage}, Cards: ${cards.length}`);
    },

    loadState() {
        if (existsSync(CONFIG.stateFile) && existsSync(CONFIG.cardsFile)) {
            logger.info('Loading previous state...');
            const state = JSON.parse(readFileSync(CONFIG.stateFile, 'utf-8'));
            const cards = JSON.parse(readFileSync(CONFIG.cardsFile, 'utf-8'));
            return { state, cards };
        }
        logger.info('No previous state found, starting fresh');
        return null;
    }
};

const dataFetcher = {
    async fetchSets() {
        try {
            logger.info('Fetching all Pokemon TCG sets...');
            const response = await apiClient.get('/sets');
            const { data } = response;
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid response format for sets');
            }
            const sets = data.map((set) => ({
                id: set.id,
                name: set.name,
                series: set.series,
                printedTotal: set.printedTotal,
                total: set.total,
                releaseDate: set.releaseDate,
                symbolUrl: set.images?.symbol || null,
            }));
            ensureDirectoryExists(CONFIG.setsFile);
            writeFileSync(CONFIG.setsFile, JSON.stringify(sets, null, 2));
            logger.success(`Retrieved ${sets.length} sets`);
            return sets;
        } catch (error) {
            logger.error(`Failed to fetch sets: ${error.message}`);
            throw error;
        }
    },

    async fetchSetPage(setId, page) {
        try {
            const params = {
                page,
                pageSize: CONFIG.pageSize,
                q: `set.id:${setId}`
            };
            const response = await apiClient.get('/cards', params);
            const { data, totalCount } = response;
            if (!data || !Array.isArray(data)) {
                throw new Error(`Invalid response format for set ${setId}`);
            }
            const cards = data.map((card) => ({
                id: card.id,
                name: card.name,
                set_id: card.set.id,
                number: card.number,
                rarity: card.rarity || 'Unknown',
                nationalPokedexNumbers: card.nationalPokedexNumbers ? JSON.stringify(card.nationalPokedexNumbers).replace(/[\[\]]/g, '') : null,
                images_small: card.images?.small || null,
                images_large: card.images?.large || null,
            }));
            const hasMorePages = page * CONFIG.pageSize < totalCount;
            return { cards, hasMorePages, totalCount };
        } catch (error) {
            logger.error(`Failed to fetch set ${setId} page ${page}: ${error.message}`);
            throw error;
        }
    },

    async fetchFullSet(setId, startPage = 1, existingCards = []) {
        const allCards = [...existingCards];
        let page = startPage;
        let hasMorePages = true;
        let totalCards = 0;
        logger.info(`Fetching cards for set ${setId} starting from page ${startPage}`);
        try {
            while (hasMorePages) {
                logger.progress(`Set ${setId} - Fetching page ${page}...`);
                const result = await this.fetchSetPage(setId, page);
                allCards.push(...result.cards);
                hasMorePages = result.hasMorePages;
                totalCards = result.totalCount;
                page++;
            }
            logger.info(`\nCompleted set ${setId}: ${allCards.length}/${totalCards} cards fetched`);
            return allCards;
        } catch (error) {
            logger.error(`Error while fetching set ${setId}, completed ${allCards.length} cards on page ${page - 1}`);
            throw { error, lastCompletedPage: page - 1, cards: allCards };
        }
    }
};
const main = async () => {
    let allCards = [];
    let currentSetIndex = 0;
    let currentPage = 1;
    try {
        ensureDirectoryExists(CONFIG.dataDir);
        const savedState = stateManager.loadState();
        const allSets = existsSync(CONFIG.setsFile)
            ? JSON.parse(readFileSync(CONFIG.setsFile, 'utf-8'))
            : await dataFetcher.fetchSets();
        if (savedState) {
            allCards = savedState.cards;
            currentSetIndex = savedState.state.currentSetIndex;
            currentPage = savedState.state.currentPage;
            logger.info(`Resuming from set index ${currentSetIndex} (${allSets[currentSetIndex]?.id}), page ${currentPage}, with ${allCards.length} cards already fetched`);
        } else {
            logger.info(`Starting fresh with ${allSets.length} sets to process`);
        }
        const limit = pLimit(CONFIG.concurrency);
        const remainingSets = allSets.slice(currentSetIndex);
        logger.info(`Processing ${remainingSets.length} remaining sets with concurrency of ${CONFIG.concurrency}`);
        for (let i = 0; i < remainingSets.length; i += CONFIG.concurrency) {
            const batch = remainingSets.slice(i, i + CONFIG.concurrency);
            const batchIndex = currentSetIndex + i;
            const batchPromises = batch.map((set, index) => {
                const setIndex = batchIndex + index;
                const existingCardsForSet = allCards.filter(card => card.set_id === set.id);
                const startPage = setIndex === currentSetIndex ? currentPage : 1;
                return limit(async () => {
                    logger.info(`Starting set ${setIndex + 1}/${allSets.length}: ${set.id} (${set.name})`);
                    try {
                        const setCards = await dataFetcher.fetchFullSet(set.id, startPage, existingCardsForSet);
                        return {
                            success: true,
                            setIndex,
                            setId: set.id,
                            cards: setCards
                        };
                    } catch (error) {
                        return {
                            success: false,
                            setIndex,
                            setId: set.id,
                            error,
                            lastCompletedPage: error.lastCompletedPage,
                            cards: error.cards || []
                        };
                    }
                });
            });
            const results = await Promise.all(batchPromises);
            let hasError = false;
            for (const result of results) {
                if (result.success) {
                    allCards = allCards.filter(card => card.set_id !== result.setId);
                    allCards.push(...result.cards);
                    logger.success(`Set ${result.setId} completed (${result.cards.length} cards)`);
                } else {
                    hasError = true;
                    allCards = allCards.filter(card => card.set_id !== result.setId);
                    allCards.push(...result.cards);
                    logger.error(`Failed processing set ${result.setId} at page ${result.lastCompletedPage || '?'}`);
                    stateManager.saveState(allSets, result.setIndex, result.lastCompletedPage + 1 || 1, allCards);
                }
            }
            if (!hasError) {
                const nextSetIndex = batchIndex + batch.length;
                stateManager.saveState(allSets, nextSetIndex, 1, allCards);
            }
            if (hasError) {
                throw new Error('Batch processing encountered errors, stopping execution');
            }
        }
        logger.success(`All done! Downloaded information for ${allCards.length} cards across ${allSets.length} sets`);
    } catch (error) {
        logger.error(`Fatal error: ${error.message}`);
        logger.info('You can restart the script to resume from the last saved state');
        process.exit(1);
    }
};

main();
