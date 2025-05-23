<?php

namespace App\Services;

use Illuminate\Console\Command;

class FastSyncStrategy implements SyncStrategyInterface
{
    public function __construct(
        private readonly PokemonApiClient $apiClient,
        private readonly DatabaseService $databaseService,
        private readonly ProgressTracker $progressTracker,
        private readonly MemoryManager $memoryManager,
        private readonly RetryHandler $retryHandler,
        private readonly PokemonConfig $config,
        private readonly Command $command
    ) {}

    public function sync(): array
    {
        $this->command->info('Starting fast sync (new cards only)...');

        $existingCardIds = $this->databaseService->getExistingCardIds();
        $existingCount = count($existingCardIds);

        $this->command->info("Found {$existingCount} existing cards");

        if ($existingCount === 0) {
            $this->command->info('No existing cards, falling back to full sync');
            $fullSync = new FullSyncStrategy(
                $this->apiClient,
                $this->databaseService,
                $this->progressTracker,
                $this->memoryManager,
                $this->retryHandler,
                $this->config,
                $this->command,
                'cards'
            );
            return $fullSync->sync();
        }

        return $this->syncNewCardsOnly($existingCardIds);
    }

    public function getName(): string
    {
        return 'Fast Sync (New Cards Only)';
    }

    private function syncNewCardsOnly(array $existingCardIds): array
    {
        $pageSize = $this->config->getPageSize('fast_cards');
        $startPage = $this->progressTracker->get('fast_sync_page', 1);
        $results = [
            'new' => $this->progressTracker->get('fast_sync_new', 0),
            'processed_pages' => $this->progressTracker->get('fast_sync_processed_pages', 0),
            'consecutive_empty' => $this->progressTracker->get('fast_sync_consecutive_empty', 0),
        ];

        $maxConsecutiveEmpty = $this->config->getMaxConsecutiveEmptyPages();
        $setsCache = $this->databaseService->getSetsCache();
        $page = $startPage;

        while ($results['consecutive_empty'] < $maxConsecutiveEmpty) {
            try {
                $this->memoryManager->checkUsage();

                $response = $this->retryHandler->executeWithRetry(
                    fn() => $this->apiClient->getSinglePage('cards', [
                        'page' => $page,
                        'pageSize' => $pageSize,
                        'orderBy' => '-set.releaseDate',
                    ]),
                    "fast sync page {$page}"
                );

                $cardsData = $response['data'] ?? [];

                if (empty($cardsData)) {
                    break;
                }

                $newCards = array_filter($cardsData, function ($card) use ($existingCardIds) {
                    return !in_array($card['id'], $existingCardIds);
                });

                if (empty($newCards)) {
                    $results['consecutive_empty']++;
                    $this->command->line("Page {$page}: No new cards (consecutive empty: {$results['consecutive_empty']})");
                } else {
                    $results['consecutive_empty'] = 0;
                    $chunkResults = $this->databaseService->processCardsInBatches($newCards, $setsCache);
                    $results['new'] += $chunkResults['new'];

                    $this->command->info("Page {$page}: Found {$chunkResults['new']} new cards");
                }

                $results['processed_pages']++;
                $this->saveProgress($page + 1, $results);
                $page++;

            } catch (\Exception $e) {
                $this->saveProgress($page, $results);
                throw $e;
            }
        }

        $this->command->info("Fast sync completed. Found {$results['new']} new cards across {$results['processed_pages']} pages");
        return $results;
    }

    private function saveProgress(int $page, array $results): void
    {
        $this->progressTracker->set('fast_sync_page', $page);
        foreach ($results as $key => $value) {
            $this->progressTracker->set("fast_sync_{$key}", $value);
        }
        $this->progressTracker->save();
    }
}
