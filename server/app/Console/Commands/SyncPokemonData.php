<?php

namespace App\Console\Commands;

use App\Services\PokemonSyncService;
use Illuminate\Console\Command;
use Exception;

class SyncPokemonData extends Command
{
    protected $signature = 'pokemon:sync
    {strategy=new : Sync strategy (full, new, update)}
    {--e|endpoint=cards : Endpoint to sync (sets, cards)}
    {--r|reset-progress : Reset sync progress before starting}
    {--p|show-progress : Show current sync progress}';

    protected $description = 'Sync Pokemon TCG data from API';

    public function __construct(
        private readonly PokemonSyncService $syncService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        if ($this->option('show-progress')) {
            return $this->showProgress();
        }

        $strategy = $this->argument('strategy');
        $options = [
            'endpoint' => $this->option('endpoint'),
            'reset_progress' => $this->option('reset-progress'),
        ];

        if ($options['reset_progress']) {
            if ($this->confirm('Are you sure you want to reset sync progress?')) {
                $this->syncService->resetProgress();
                $this->info('Sync progress reset.');
            } else {
                $this->info('Progress reset cancelled.');

                return 0;
            }
        }

        try {
            $results = $this->syncService->sync($strategy, $this, $options);

            return 0;
        } catch (Exception $e) {
            $this->error('Sync failed: ' . $e->getMessage());

            return 1;
        }
    }

    private function showProgress(): int
    {
        $progress = $this->syncService->getProgress();

        if (empty($progress)) {
            $this->info('No sync progress found.');

            return 0;
        }

        $this->info('Current sync progress:');
        $this->table(
            ['Key', 'Value'],
            collect($progress)->map(fn ($value, $key) => [$key, $value])->toArray()
        );

        return 0;
    }
}
