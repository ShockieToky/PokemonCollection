<?php

namespace App\Services;

use App\Exceptions\PokemonSyncException;
use Illuminate\Console\Command;
use Exception;

readonly class PokemonSyncService
{
    public function __construct(
        private PokemonApiClient $apiClient,
        private DatabaseService $databaseService,
        private ProgressTracker $progressTracker,
        private MemoryManager $memoryManager,
        private RetryHandler $retryHandler,
        private PokemonConfig $config
    ) {}

    public function sync(string $strategy, Command $command, array $options = []): array
    {
        $this->memoryManager->setMemoryLimit($this->config->getDefaultMemoryLimit());
        $this->progressTracker->load();

        $command->info("Starting Pokemon sync with strategy: {$strategy}");
        $command->info('Memory limit: ' . ini_get('memory_limit'));

        try {
            $syncStrategy = $this->createStrategy($strategy, $command, $options);
            $startTime = microtime(true);

            $results = $syncStrategy->sync();

            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);

            $this->logResults($command, $syncStrategy->getName(), $results, $duration);

            // Clean up progress on successful completion
            if ($options['reset_progress'] ?? false) {
                $this->progressTracker->reset();
            }

            return $results;
        } catch (Exception $e) {
            $command->error('Sync failed: ' . $e->getMessage());
            $command->error('Progress has been saved. You can resume by running the command again.');

            throw new PokemonSyncException(
                'Sync failed: ' . $e->getMessage(),
                $strategy,
                0,
                $e
            );
        }
    }

    public function getProgress(): array
    {
        $this->progressTracker->load();

        return $this->progressTracker->getProgress();
    }

    public function resetProgress(): void
    {
        $this->progressTracker->reset();
    }

    private function createStrategy(string $strategy, Command $command, array $options): FastSyncStrategy|FullSyncStrategy|UpdateSyncStrategy
    {
        return match ($strategy) {
            'full' => new FullSyncStrategy(
                $this->apiClient,
                $this->databaseService,
                $this->progressTracker,
                $this->memoryManager,
                $this->retryHandler,
                $this->config,
                $command,
                $options['endpoint'] ?? 'cards'
            ),
            'new' => new FastSyncStrategy(
                $this->apiClient,
                $this->databaseService,
                $this->progressTracker,
                $this->memoryManager,
                $this->retryHandler,
                $this->config,
                $command
            ),
            'update' => new UpdateSyncStrategy(
                $this->apiClient,
                $this->databaseService,
                $this->progressTracker,
                $this->memoryManager,
                $this->retryHandler,
                $this->config,
                $command
            ),
            default => throw new PokemonSyncException("Unknown sync strategy: {$strategy}")
        };
    }

    private function logResults(Command $command, string $strategyName, array $results, float $duration): void
    {
        $command->info("\n=== Sync Complete: {$strategyName} ===");
        $command->info("Duration: {$duration} seconds");

        foreach ($results as $key => $value) {
            $command->info(ucfirst($key) . ": {$value}");
        }

        $command->info('Final memory usage: ' . $this->formatBytes(memory_get_usage(true)));
        $command->info('Peak memory usage: ' . $this->formatBytes(memory_get_peak_usage(true)));
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(log($bytes) / log(1024));

        return round($bytes / (1024 ** $pow), 2) . ' ' . $units[$pow];
    }
}
