<?php

return [
    'api_base_url' => env('POKEMON_API_URL', 'https://api.pokemontcg.io/v2'),
    'page_sizes' => [
        'sets' => 250,
        'cards' => 100,
        'fast_cards' => 250,
    ],
    'rate_limiting' => [
        'base_delay' => env('POKEMON_BASE_DELAY', 1),
        'max_retries' => env('POKEMON_MAX_RETRIES', 3),
        'backoff_multiplier' => 2.0,
        'concurrent_requests' => env('POKEMON_CONCURRENT_REQUESTS', 5),
    ],
    'batch_sizes' => [
        'database_insert' => 100,
        'processing' => 200,
        'memory_check' => 1000,
    ],
    'memory' => [
        'default_limit' => '512M',
        'threshold_percentage' => 80,
    ],
    'sync' => [
        'max_consecutive_empty_pages' => 10,
        'sync_completion_threshold' => 90,
    ],
    'ssl' => [
        'verify' => env('POKEMON_SSL_VERIFY', true),
    ],
];
