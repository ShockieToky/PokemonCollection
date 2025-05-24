<?php

namespace App\Services;

use Illuminate\Console\Command;

class UpdateSyncStrategy implements SyncStrategyInterface
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
        $this->command->info('Starting Update sync (checking for updates)...');

        $lastSyncDate = $this->progressTracker->get('last_Update_sync');
        if (!$lastSyncDate) {
            $this->command->info('No previous Update sync found, performing fast sync');
            $fastSync = new FastSyncStrategy(
                $this->apiClient,
                $this->databaseService,
                $this->progressTracker,
                $this->memoryManager,
                $this->retryHandler,
                $this->config,
                $this->command
            );
            $results = $fastSync->sync();
        } else {
            $this->command->info("Last Update sync: {$lastSyncDate}");
            $results = $this->syncUpdatedCards($lastSyncDate);
        }

        // Update last sync timestamp
        $this->progressTracker->set('last_Update_sync', now()->toDateTimeString());
        $this->progressTracker->save();

        return $results;
    }

    public function getName(): string
    {
        return 'Update Sync (Updates Only)';
    }

    private function syncUpdatedCards(string $lastSyncDate): array
    {
        $results = ['new' => 0, 'updated' => 0, 'processed' => 0];
        $pageSize = $this->config->getPageSize('cards');
        $page = 1;
        $setsCache = $this->databaseService->getSetsCache();

        // Get existing cards for comparison
        $existingCards = $this->databaseService->getExistingCardsForUpdate()
            ->keyBy('card_id');

        while (true) {
            try {
                $this->memoryManager->checkUsage();

                $response = $this->retryHandler->executeWithRetry(
                    fn() => $this->apiClient->getSinglePage('cards', [
                        'page' => $page,
                        'pageSize' => $pageSize,
                        'q' => "set.updatedAt:[{$lastSyncDate} TO *]",
                        'orderBy' => '-set.updatedAt',
                    ]),
                    "Update sync page {$page}"
                );

                $cardsData = $response['data'] ?? [];

                if (empty($cardsData)) {
                    break;
                }

                foreach ($cardsData as $cardData) {
                    $cardId = $cardData['id'];
                    $existingCard = $existingCards->get($cardId);

                    $setName = trim($cardData['set']['name'] ?? '');
                    $setId = $setsCache[$setName] ?? null;

                    if (!$setId) {
                        continue;
                    }

                    $cardAttributes = [
                        'name' => $cardData['name'],
                        'set_id' => $setId,
                        'number' => $cardData['number'] ?? '',
                        'rarity' => $cardData['rarity'] ?? null,
                        'nationalPokedexNumbers' => json_encode($cardData['nationalPokedexNumbers'] ?? []),
                        'images_small' => $cardData['images']['small'] ?? null,
                        'images_large' => $cardData['images']['large'] ?? null,
                        'updated_at' => now(),
                    ];

                    if (!$existingCard) {
                        // New card
                        $cardAttributes['card_id'] = $cardId;
                        $cardAttributes['created_at'] = now();
                        \App\Models\Card::create($cardAttributes);
                        $results['new']++;
                    } else {
                        // Update existing card
                        $this->databaseService->updateCard($cardId, $cardAttributes);
                        $results['updated']++;
                    }

                    $results['processed']++;
                }

                $this->command->info("Processed page {$page}: {$results['processed']} cards total");
                $page++;

            } catch (\Exception $e) {
                $this->command->error("Error on page {$page}: " . $e->getMessage());
                throw $e;
            }
        }

        return $results;
    }
}
