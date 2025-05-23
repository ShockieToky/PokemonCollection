<?php

namespace App\Services;

class DataValidator
{
    public function validateSetData(array $setData): bool
    {
        return isset($setData['name'], $setData['series'], $setData['total']);
    }

    public function validateCardData(array $cardData): bool
    {
        return isset(
            $cardData['id'],
            $cardData['name'],
            $cardData['set']['name']
        );
    }

    public function sanitizeSetData(array $setData): array
    {
        return [
            'name' => trim($setData['name'] ?? ''),
            'series' => trim($setData['series'] ?? ''),
            'printedTotal' => (int) ($setData['printedTotal'] ?? 0),
            'total' => (int) ($setData['total'] ?? 0),
            'releaseDate' => $setData['releaseDate'] ?? null,
            'symbol_images' => $setData['images']['symbol'] ?? null,
        ];
    }

    public function sanitizeCardData(array $cardData, int $setId): array
    {
        return [
            'card_id' => trim($cardData['id']),
            'name' => trim($cardData['name']),
            'set_id' => $setId,
            'number' => trim($cardData['number'] ?? ''),
            'rarity' => $cardData['rarity'] ?? null,
            'nationalPokedexNumbers' => json_encode($cardData['nationalPokedexNumbers'] ?? []),
            'images_small' => $cardData['images']['small'] ?? null,
            'images_large' => $cardData['images']['large'] ?? null,
        ];
    }
}
