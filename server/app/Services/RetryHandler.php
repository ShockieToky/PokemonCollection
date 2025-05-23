<?php

namespace App\Services;

use App\Exceptions\RateLimitException;
use Exception;
use Illuminate\Console\Command;

class RetryHandler
{
    public function __construct(
        private readonly PokemonConfig $config,
        private readonly Command $command
    ) {}

    public function executeWithRetry(callable $operation, string $context = ''): mixed
    {
        $attempt = 0;
        $maxRetries = $this->config->getMaxRetries();

        while ($attempt <= $maxRetries) {
            try {
                return $operation();
            } catch (RateLimitException $e) {
                $attempt++;
                if ($attempt > $maxRetries) {
                    throw $e;
                }

                $delay = $this->calculateBackoffDelay($attempt);
                $this->command->warn(
                    "Rate limit hit for {$context}, retrying in {$delay} seconds " .
                    "(attempt {$attempt}/{$maxRetries})"
                );
                sleep($delay);
            }
        }

        throw new Exception("Max retries exceeded for: {$context}");
    }

    private function calculateBackoffDelay(int $attempt): int
    {
        return (int) (
            $this->config->getBaseDelay() *
            pow($this->config->getBackoffMultiplier(), $attempt)
        );
    }
}
