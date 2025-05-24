<?php

namespace App\Services;

use App\Exceptions\PokemonApiException;
use App\Exceptions\RateLimitException;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PokemonApiClient
{
    private const RATE_LIMIT_STATUS = 429;
    private const TIMEOUT_SECONDS = 30;

    public function __construct(
        private readonly PokemonConfig $config
    ) {}

    public function getSinglePage(string $endpoint, array $query = []): array
    {
        $url = $this->buildUrl($endpoint);

        Log::debug('Pokemon API request', [
            'endpoint' => $endpoint,
            'query' => $query,
            'url' => $url,
        ]);

        $response = $this->makeRequest($url, $query);

        if ($response->status() === self::RATE_LIMIT_STATUS) {
            throw new RateLimitException('Rate limit exceeded', $endpoint);
        }

        if ($response->failed()) {
            throw new PokemonApiException(
                "API request failed with status: {$response->status()}",
                $endpoint
            );
        }

        return $response->json();
    }

    public function getMultiplePages(array $pages, string $endpoint, int $pageSize): array
    {
        sleep($this->config->getBaseDelay());

        $responses = Http::pool(function (Pool $pool) use ($pages, $endpoint, $pageSize) {
            $requests = [];
            foreach ($pages as $page) {
                $requests[] = $pool
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->withOptions($this->getHttpOptions())
                    ->get($this->buildUrl($endpoint), [
                        'page' => $page,
                        'pageSize' => $pageSize,
                    ]);
            }
            return $requests;
        });

        return $this->processPoolResponses($responses, $endpoint);
    }

    private function makeRequest(string $url, array $query): Response
    {
        return Http::timeout(self::TIMEOUT_SECONDS)
            ->withOptions($this->getHttpOptions())
            ->get($url, $query);
    }

    private function getHttpOptions(): array
    {
        return [
            'verify' => $this->config->shouldVerifySSL(),
            'curl' => [
                CURLOPT_SSL_VERIFYPEER => $this->config->shouldVerifySSL(),
                CURLOPT_SSL_VERIFYHOST => $this->config->shouldVerifySSL() ? 2 : 0,
            ],
        ];
    }

    private function buildUrl(string $endpoint): string
    {
        return rtrim($this->config->getApiBaseUrl(), '/') . '/' . ltrim($endpoint, '/');
    }

    private function processPoolResponses(array $responses, string $endpoint): array
    {
        $allData = [];
        $hasRateLimit = false;

        foreach ($responses as $response) {
            if ($response->ok()) {
                $data = $response->json();
                $responseData = $data['data'] ?? [];
                $allData = array_merge($allData, $responseData);
            } elseif ($response->status() === self::RATE_LIMIT_STATUS) {
                $hasRateLimit = true;
            } else {
                Log::warning('Pokemon API request failed', [
                    'endpoint' => $endpoint,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
            unset($response);
        }

        if ($hasRateLimit) {
            throw new RateLimitException('Rate limit exceeded in pool request', $endpoint);
        }

        return $allData;
    }
}
