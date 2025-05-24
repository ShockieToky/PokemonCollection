<?php

namespace App\Services;

use App\Exceptions\ConfigurationException;

class PokemonConfig
{
    private array $config;

    public function __construct()
    {
        $this->config = config('pokemon');

        if (empty($this->config)) {
            throw new ConfigurationException('Pokemon configuration not found');
        }
    }

    public function getApiBaseUrl(): string
    {
        return $this->config['api_base_url'];
    }

    public function getPageSize(string $type): int
    {
        return $this->config['page_sizes'][$type] ?? 100;
    }

    public function getBaseDelay(): int
    {
        return max(1, $this->config['rate_limiting']['base_delay']);
    }

    public function getMaxRetries(): int
    {
        return $this->config['rate_limiting']['max_retries'];
    }

    public function getBackoffMultiplier(): float
    {
        return $this->config['rate_limiting']['backoff_multiplier'];
    }

    public function getConcurrentRequests(): int
    {
        return min(15, $this->config['rate_limiting']['concurrent_requests']);
    }

    public function getBatchSize(string $type): int
    {
        return $this->config['batch_sizes'][$type] ?? 100;
    }

    public function getMemoryThreshold(): int
    {
        return $this->config['memory']['threshold_percentage'];
    }

    public function getDefaultMemoryLimit(): string
    {
        return $this->config['memory']['default_limit'];
    }

    public function getMaxConsecutiveEmptyPages(): int
    {
        return $this->config['sync']['max_consecutive_empty_pages'];
    }

    public function getSyncCompletionThreshold(): int
    {
        return $this->config['sync']['sync_completion_threshold'];
    }

    public function shouldVerifySSL(): bool
    {
        return $this->config['ssl']['verify'];
    }
}
