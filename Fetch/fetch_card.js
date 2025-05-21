import axios from "axios";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import pLimit from 'p-limit';

const CONFIG = {
	baseUrl: 'https://api.pokemontcg.io/v2',
	pageSize: 250,
	retryAttempts: 3,
	retryDelay: 2000,
	concurrency: 15,
	rateLimitDelay: 500,
	dataDir: './data',
	stateFile: './data/fetch_state.json',
	cardsNdjsonFile: './data/cards.ndjson',
	setsNdjsonFile: './data/sets.ndjson',
	counterFile: './data/counter.json',
};

const ensureDirectoryExists = (filePath) => {
	const dir = dirname(filePath);
	if (!existsSync(dir)) {
		mkdirSync(dir, {recursive: true});
	}
};

const logger = {
	startTime: Date.now(),
	checkpoints: {},
	info: (message) => console.log(`[${ new Date().toISOString() }] INFO: ${ message }`),
	error: (message) => console.error(`[${ new Date().toISOString() }] ERROR: ${ message }`),
	success: (message) => console.log(`[${ new Date().toISOString() }] SUCCESS: ${ message }`),
	progress: (message) => process.stdout.write(`\r[${ new Date().toISOString() }] ${ message }`),
	mark: (checkpoint) => {
		logger.checkpoints[checkpoint] = Date.now();
		return logger.checkpoints[checkpoint];
	},

	measure: (start, end) => {
		const startTime = typeof start === 'string' ? logger.checkpoints[start] : start;
		const endTime = end ? (typeof end === 'string' ? logger.checkpoints[end] : end) : Date.now();
		return ((endTime - startTime) / 1000).toFixed(2) + 's';
	},

	performance: (checkpoint, message) => {
		const now = logger.mark(checkpoint);
		const elapsed = logger.measure(logger.startTime, now);
		console.log(`[${ new Date().toISOString() }] PERF: ${ message } - Total elapsed: ${ elapsed }`);
	}
};

const apiClient = {
	client: axios.create({
		timeout: 10000,
		headers: {
			'Accept-Encoding': 'gzip,deflate,compress',
			'User-Agent': 'Pokemon-TCG-Data-Fetcher',
		},
		maxContentLength: 50 * 1024 * 1024, // 50MB
	}),

	requestQueue: [],
	isProcessingQueue: false,
	lastRequestTime: 0,

	async get(endpoint, params = {}, attempts = 0) {
		try {
			const url = `${ CONFIG.baseUrl }${ endpoint }`;
			const now = Date.now();
			const elapsed = now - this.lastRequestTime;
			if (elapsed < CONFIG.rateLimitDelay) {
				await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimitDelay - elapsed));
			}
			this.lastRequestTime = Date.now();
			const response = await this.client.get(url, {params});
			return response.data;
		} catch (error) {
			const status = error.response?.status;
			if (status === 429) {
				const retryAfter = parseInt(error.response?.headers['retry-after'] || '2') * 1000;
				logger.info(`Rate limited, waiting for ${ retryAfter / 1000 }s before retry`);
				await new Promise(resolve => setTimeout(resolve, retryAfter));
				return this.get(endpoint, params, attempts);
			}
			if (attempts < CONFIG.retryAttempts) {
				const delay = CONFIG.retryDelay * Math.pow(2, attempts);
				logger.error(`Request failed with ${ status || 'network error' }, retrying in ${ delay }ms... (${ attempts + 1 }/${ CONFIG.retryAttempts })`);
				await new Promise(resolve => setTimeout(resolve, delay));
				return this.get(endpoint, params, attempts + 1);
			}

			throw new Error(`API request failed after ${ CONFIG.retryAttempts } attempts: ${ error.message }`);
		}
	}
};

class NdjsonWriter {
	constructor(filePath, options = {}) {
		ensureDirectoryExists(filePath);
		this.filePath = filePath;
		this.options = options;
		this.stream = null;
		this.recordCount = 0;
	}

	open(mode = 'w') {
		if (this.stream) this.close();
		const flags = mode === 'a' ? 'a' : 'w';
		this.stream = createWriteStream(this.filePath, {flags, encoding: 'utf8'});
		return this;
	}

	write(data) {
		if (!this.stream) this.open();

		if (Array.isArray(data)) {
			for (const item of data) {
				this.stream.write(JSON.stringify(item) + '\n');
				this.recordCount++;
			}
		} else {
			this.stream.write(JSON.stringify(data) + '\n');
			this.recordCount++;
		}

		return this;
	}

	async close() {
		if (this.stream) {
			await new Promise(resolve => {
				this.stream.end(() => {
					this.stream = null;
					resolve();
				});
			});
		}
		return this.recordCount;
	}
}

class CounterManager {
	constructor(filePath) {
		this.filePath = filePath;
		this.data = {cards: 0, sets: 0};
		this.loadCounters();
	}

	loadCounters() {
		try {
			if (existsSync(this.filePath)) {
				this.data = JSON.parse(readFileSync(this.filePath, 'utf8'));
				logger.info(`Loaded counters: cards=${ this.data.cards }, sets=${ this.data.sets }`);
			} else {
				logger.info('No counters found, starting from 0');
				this.saveCounters();
			}
		} catch (error) {
			logger.error(`Error loading counters: ${ error.message }`);
			this.saveCounters();
		}
	}

	saveCounters() {
		ensureDirectoryExists(this.filePath);
		writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
	}

	nextCardId() {
		this.data.cards++;
		return this.data.cards;
	}

	nextSetId() {
		this.data.sets++;
		return this.data.sets;
	}
}

const counters = new CounterManager(CONFIG.counterFile);

const stateManager = {
	async saveState(sets, currentSetIndex, currentPage, cardsCount, setIdMap) {
		const state = {
			setsCompleted: sets,
			currentSetIndex,
			currentPage,
			cardsCount,
			setIdMap,
			lastUpdate: new Date().toISOString()
		};
		const tempFile = `${ CONFIG.stateFile }.tmp`;
		ensureDirectoryExists(tempFile);
		try {
			writeFileSync(tempFile, JSON.stringify(state, null, 2));
			if (existsSync(CONFIG.stateFile)) {
				const backupFile = `${ CONFIG.stateFile }.bak`;
				writeFileSync(backupFile, readFileSync(CONFIG.stateFile));
			}
			writeFileSync(CONFIG.stateFile, readFileSync(tempFile));
			logger.info(`State saved: Set index ${ currentSetIndex }, Page ${ currentPage }, Cards: ${ cardsCount }`);
		} catch (error) {
			logger.error(`Failed to save state: ${ error.message }`);
			throw error;
		}
	},

	loadState() {
		try {
			if (existsSync(CONFIG.stateFile)) {
				logger.info('Loading previous state...');
				return JSON.parse(readFileSync(CONFIG.stateFile, 'utf-8'));
			}
		} catch (error) {
			logger.error(`Error loading state file: ${ error.message }`);
			const backupFile = `${ CONFIG.stateFile }.bak`;
			if (existsSync(backupFile)) {
				logger.info('Attempting to recover from backup state file...');
				try {
					return JSON.parse(readFileSync(backupFile, 'utf-8'));
				} catch (backupError) {
					logger.error(`Failed to recover from backup: ${ backupError.message }`);
				}
			}
		}
		logger.info('No previous state found, starting fresh');
		return null;
	}
};

const dataFetcher = {
	async fetchSets() {
		try {
			logger.mark('fetchSetsStart');
			logger.info('Fetching all Pokemon TCG sets...');
			const response = await apiClient.get('/sets');
			const {data} = response;
			if (!data || !Array.isArray(data)) {
				throw new Error('Invalid response format for sets');
			}
			const setIdMap = {};
			data.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
			const setWriter = new NdjsonWriter(CONFIG.setsNdjsonFile);
			const sets = [];
			for (let i = 0 ; i < data.length ; i++) {
				const set = data[i];
				const numericId = counters.nextSetId();
				setIdMap[set.id] = numericId;
				const formattedSet = {
					id: numericId,
					original_id: set.id,
					name: set.name,
					series: set.series,
					printedTotal: set.printedTotal,
					total: set.total,
					releaseDate: set.releaseDate,
					symbolUrl: set.images?.symbol || null,
				};
				setWriter.write(formattedSet);
				sets.push(formattedSet);
			}
			await setWriter.close();
			counters.saveCounters();
			logger.performance('fetchSetsEnd', `Retrieved ${ sets.length } sets`);
			return {sets, setIdMap};
		} catch (error) {
			logger.error(`Failed to fetch sets: ${ error.message }`);
			throw error;
		}
	},

	async fetchSetPage(setId, setIdMap, page) {
		try {
			const params = {
				page,
				pageSize: CONFIG.pageSize,
				q: `set.id:${ setId }`
			};
			const response = await apiClient.get('/cards', params);
			const {data, totalCount} = response;
			if (!data || !Array.isArray(data)) {
				throw new Error(`Invalid response format for set ${ setId }`);
			}
			const cardWriter = new NdjsonWriter(CONFIG.cardsNdjsonFile, {flags: 'a'});
			cardWriter.open('a');
			const cards = [];
			for (const card of data) {
				const numericId = counters.nextCardId();
				const formattedCard = {
					id: numericId,
					original_id: card.id,
					name: card.name,
					set_id: setIdMap[card.set.id],
					original_set_id: card.set.id,
					number: card.number,
					rarity: card.rarity || 'Unknown',
					nationalPokedexNumbers: card.nationalPokedexNumbers || null,
					images_small: card.images?.small || null,
					images_large: card.images?.large || null,
				};
				cardWriter.write(formattedCard);
				cards.push(formattedCard);
			}

			await cardWriter.close();
			counters.saveCounters();
			const hasMorePages = page * CONFIG.pageSize < totalCount;
			return {cards, hasMorePages, totalCount};
		} catch (error) {
			logger.error(`Failed to fetch set ${ setId } page ${ page }: ${ error.message }`);
			throw error;
		}
	},

	async fetchFullSet(setId, setIdMap, startPage = 1) {
		let page = startPage;
		let hasMorePages = true;
		let totalCards = 0;
		let fetchedCards = 0;
		logger.mark(`fetchSet_${ setId }_start`);
		logger.info(`Fetching cards for set ${ setId } starting from page ${ startPage }`);
		try {
			while (hasMorePages) {
				logger.progress(`Set ${ setId } - Fetching page ${ page }...`);
				const result = await this.fetchSetPage(setId, setIdMap, page);

				fetchedCards += result.cards.length;
				hasMorePages = result.hasMorePages;
				totalCards = result.totalCount;
				page++;
			}
			const perfTime = logger.measure(`fetchSet_${ setId }_start`);
			logger.info(`\nCompleted set ${ setId }: ${ fetchedCards }/${ totalCards } cards fetched in ${ perfTime }`);
			return {fetchedCards, totalCards};
		} catch (error) {
			logger.error(`Error while fetching set ${ setId }, completed ${ fetchedCards } cards on page ${ page - 1 }`);
			throw {error, lastCompletedPage: page - 1, fetchedCards};
		}
	}
};

const main = async () => {
	let totalCardsCount = 0;
	let currentSetIndex = 0;
	let currentPage = 1;
	let allSets = [];
	let setIdMap = {};

	try {
		ensureDirectoryExists(CONFIG.dataDir);

		// Initialize or reset NDJSON files if starting fresh
		const savedState = stateManager.loadState();

		if (!savedState) {
			// Starting fresh, create empty NDJSON files
			writeFileSync(CONFIG.cardsNdjsonFile, '');

			// Fetch sets and create mapping
			const setsData = await dataFetcher.fetchSets();
			allSets = setsData.sets;
			setIdMap = setsData.setIdMap;
		} else {
			// Resume from saved state
			currentSetIndex = savedState.currentSetIndex;
			currentPage = savedState.currentPage;
			totalCardsCount = savedState.cardsCount;
			setIdMap = savedState.setIdMap;
			allSets = savedState.setsCompleted;

			logger.info(`Resuming from set index ${ currentSetIndex } (${ allSets[currentSetIndex]?.original_id }), page ${ currentPage }, with ${ totalCardsCount } cards already fetched`);
		}

		const limit = pLimit(CONFIG.concurrency);
		const remainingSets = allSets.slice(currentSetIndex);

		logger.info(`Processing ${ remainingSets.length } remaining sets with concurrency of ${ CONFIG.concurrency }`);

		for (let i = 0 ; i < remainingSets.length ; i += CONFIG.concurrency) {
			const batch = remainingSets.slice(i, i + CONFIG.concurrency);
			const batchIndex = currentSetIndex + i;

			const batchPromises = batch.map((set, index) => {
				const setIndex = batchIndex + index;
				const startPage = setIndex === currentSetIndex ? currentPage : 1;

				return limit(async () => {
					logger.info(`Starting set ${ setIndex + 1 }/${ allSets.length }: ${ set.original_id } (${ set.name })`);
					try {
						const result = await dataFetcher.fetchFullSet(set.original_id, setIdMap, startPage);
						return {
							success: true,
							setIndex,
							setId: set.original_id,
							fetchedCards: result.fetchedCards
						};
					} catch (error) {
						return {
							success: false,
							setIndex,
							setId: set.original_id,
							error,
							lastCompletedPage: error.lastCompletedPage,
							fetchedCards: error.fetchedCards || 0
						};
					}
				});
			});

			const results = await Promise.all(batchPromises);
			let hasError = false;

			for (const result of results) {
				if (result.success) {
					totalCardsCount += result.fetchedCards;
					logger.success(`Set ${ result.setId } completed (${ result.fetchedCards } cards)`);
				} else {
					hasError = true;
					totalCardsCount += result.fetchedCards;
					logger.error(`Failed processing set ${ result.setId } at page ${ result.lastCompletedPage || '?' }`);
					await stateManager.saveState(allSets, result.setIndex, result.lastCompletedPage + 1 || 1, totalCardsCount, setIdMap);
				}
			}

			if (!hasError) {
				const nextSetIndex = batchIndex + batch.length;
				await stateManager.saveState(allSets, nextSetIndex, 1, totalCardsCount, setIdMap);
			}

			if (hasError) {
				throw new Error('Batch processing encountered errors, stopping execution');
			}
		}

		logger.success(`All done! Downloaded information for ${ totalCardsCount } cards across ${ allSets.length } sets`);
	} catch (error) {
		logger.error(`Fatal error: ${ error.message }`);
		logger.info('You can restart the script to resume from the last saved state');
		process.exit(1);
	}
};

main();
