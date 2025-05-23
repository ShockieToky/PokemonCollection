<?php

namespace App\Services;

use Illuminate\Console\Command;

class FullSyncStrategy implements SyncStrategyInterface
{
    public function __construct(
        private readonly PokemonApiClient $apiClient,
        private readonly DatabaseService $databaseService,
        private readonly ProgressTracker $progressTracker,
        private readonly MemoryManager $memoryManager,
        private readonly RetryHandler $retryHandler,
        private readonly PokemonConfig $config,
        private readonly Command $command,
        private readonly string $endpoint
    ) {}

    public function sync(): array
    {
        $this->command->info("Starting full sync for {$this->endpoint}...");

        $initialResponse = $this->apiClient->getSinglePage($this->endpoint, [
            'page' => 1,
            'pageSize' => 1
        ]);

        $totalCount = $initialResponse['totalCount'] ?? 0;
        $pageSize = $this->config->getPageSize($this->endpoint);
        $totalPages = ceil($totalCount / $pageSize);

        $this->command->info("Total {$this->endpoint}: {$totalCount}, Pages: {$totalPages}");

        $startChunk = $this->progressTracker->get("{$this->endpoint}_chunk_index", 0);
        $results = [
            'new' => $this->progressTracker->get("{$this->endpoint}_new", 0),
            'updated' => $this->progressTracker->get("{$this->endpoint}_updated", 0),
            'processed' => $this->progressTracker->get("{$this->endpoint}_processed", 0),
            'skipped' => $this->progressTracker->get("{$this->endpoint}_skipped", 0),
        ];

        if ($startChunk > 0) {
            $this->command->info("Resuming from chunk " . ($startChunk + 1));
        }

        $pageChunks = collect(range(1, $totalPages))
            ->chunk($this->config->getConcurrentRequests());

        foreach ($pageChunks->skip($startChunk) as $chunkIndex => $chunk) {
            $actualChunkIndex = $startChunk + $chunkIndex;

            try {
                $this->memoryManager->checkUsage();
                $this->command->info(
                    "Processing chunk " . ($actualChunkIndex + 1) . "/" .
                    $pageChunks->count() . " - Pages: " . $chunk->implode(', ')
                );

                $allData = $this->retryHandler->executeWithRetry(
                    fn() => $this->apiClient->getMultiplePages(
                        $chunk->toArray(),
                        $this->endpoint,
                        $pageSize
                    ),
                    "{$this->endpoint} chunk " . ($actualChunkIndex + 1)
                );

                if (!empty($allData)) {
                    $chunkResults = $this->processData($allData);
                    foreach ($chunkResults as $key => $value) {
                        $results[$key] += $value;
                    }

                    $this->command->info(
                        "Processed {$results['processed']}/{$totalCount} {$this->endpoint}"
                    );
                }

                $this->saveProgress($actualChunkIndex + 1, $results);
                $this->memoryManager->garbageCollect();

            } catch (\Exception $e) {
                $this->saveProgress($actualChunkIndex, $results);
                throw $e;
            }
        }

        return $results;
    }

    public function getName(): string
    {
        return "Full {$this->endpoint} Sync";
    }

    private function processData(array $data): array
    {
        if ($this->endpoint === 'sets') {
            return $this->databaseService->processSetsInBatches($data);
        } else {
            $setsCache = $this->databaseService->getSetsCache();
            return $this->databaseService->processCardsInBatches($data, $setsCache);
        }
    }

    private function saveProgress(int $chunkIndex, array $results): void
    {
        $this->progressTracker->set("{$this->endpoint}_chunk_index", $chunkIndex);
        foreach ($results as $key => $value) {
            $this->progressTracker->set("{$this->endpoint}_{$key}", $value);
        }
        $this->progressTracker->save();
    }
}
