<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ProgressTracker
{
    private string $progressFile;
    private array $progress = [];

    public function __construct()
    {
        $this->progressFile = storage_path('app/private/pokemon_sync_progress.json');
        $this->ensureDirectoryExists();
    }

    public function load(): void
    {
        if (file_exists($this->progressFile)) {
            $content = file_get_contents($this->progressFile);
            $this->progress = json_decode($content, true) ?? [];
        }
    }

    public function save(): void
    {
        $progressData = array_merge($this->progress, [
            'timestamp' => now()->toDateTimeString(),
            'memory_usage' => $this->formatBytes(memory_get_usage(true)),
        ]);

        file_put_contents(
            $this->progressFile,
            json_encode($progressData, JSON_PRETTY_PRINT),
            LOCK_EX
        );

        Log::info('Pokemon sync progress saved', ['progress' => $progressData]);
    }

    public function reset(): void
    {
        $this->progress = [];
        if (file_exists($this->progressFile)) {
            unlink($this->progressFile);
        }
        Log::info('Pokemon sync progress reset');
    }

    public function get(string $key, $default = null)
    {
        return $this->progress[$key] ?? $default;
    }

    public function set(string $key, $value): void
    {
        $this->progress[$key] = $value;
    }

    public function update(string $key, int $amount = 1): void
    {
        $this->progress[$key] = ($this->progress[$key] ?? 0) + $amount;
    }

    public function hasProgress(): bool
    {
        return !empty($this->progress);
    }

    public function getProgress(): array
    {
        return $this->progress;
    }

    private function ensureDirectoryExists(): void
    {
        $directory = dirname($this->progressFile);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(log($bytes) / log(1024));
        return round($bytes / (1024 ** $pow), 2) . ' ' . $units[$pow];
    }
}
