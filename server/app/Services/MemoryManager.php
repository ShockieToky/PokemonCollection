<?php

namespace App\Services;

use Illuminate\Console\Command;

class MemoryManager
{
    public function __construct(
        private readonly PokemonConfig $config,
        private readonly Command $command
    ) {}

    public function checkUsage(): void
    {
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = $this->convertToBytes(ini_get('memory_limit'));
        $usagePercentage = ($memoryUsage / $memoryLimit) * 100;

        if ($usagePercentage > $this->config->getMemoryThreshold()) {
            $this->command->warn(
                'Memory usage: ' . $this->formatBytes($memoryUsage) .
                " ({$usagePercentage}% of limit)"
            );
            $this->garbageCollect();
        }
    }

    public function garbageCollect(): int
    {
        $collected = 0;
        if (function_exists('gc_collect_cycles')) {
            $collected = gc_collect_cycles();
            if ($collected > 0) {
                $this->command->line("Garbage collected: {$collected} cycles");
            }
        }
        return $collected;
    }

    public function setMemoryLimit(string $limit): void
    {
        ini_set('memory_limit', $limit);
    }

    private function convertToBytes(string $value): int
    {
        $value = trim($value);
        $unit = strtolower(substr($value, -1));
        $number = (int) substr($value, 0, -1);

        return match ($unit) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => (int) $value,
        };
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(log($bytes) / log(1024));
        return round($bytes / (1024 ** $pow), 2) . ' ' . $units[$pow];
    }
}
