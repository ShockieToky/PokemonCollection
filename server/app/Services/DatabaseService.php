<?php

namespace App\Services;

use App\Models\Card;
use App\Models\Set;
use Illuminate\Support\Collection;

readonly class DatabaseService
{
    public function __construct(
        private PokemonConfig $config
    ) {}

    public function getSetsCache(): array
    {
        $cache = [];
        Set::select(['id', 'name'])
            ->chunk($this->config->getBatchSize('memory_check'), function ($sets) use (&$cache) {
                foreach ($sets as $set) {
                    $cache[trim($set->name)] = $set->id;
                }
            });
        return $cache;
    }

    public function getExistingCardIds(): array
    {
        return Card::pluck('card_id')->toArray();
    }

    public function getCardsCount(): int
    {
        return Card::count();
    }

    public function processSetsInBatches(array $setsData): array
    {
        $results = ['new' => 0, 'updated' => 0];
        $chunks = array_chunk($setsData, $this->config->getBatchSize('processing'));

        foreach ($chunks as $chunk) {
            $result = $this->processSetsChunk($chunk);
            $results['new'] += $result['new'];
            $results['updated'] += $result['updated'];
        }

        return $results;
    }

    public function processCardsInBatches(array $cardsData, array $setsCache): array
    {
        $results = ['new' => 0, 'updated' => 0, 'skipped' => 0];
        $chunks = array_chunk($cardsData, $this->config->getBatchSize('processing'));

        foreach ($chunks as $chunk) {
            $result = $this->processCardsChunk($chunk, $setsCache);
            $results['new'] += $result['new'];
            $results['updated'] += $result['updated'];
            $results['skipped'] += $result['skipped'];
        }

        return $results;
    }

    public function getExistingCardsForUpdate(): Collection
    {
        return Card::select('card_id', 'updated_at')->get();
    }

    public function updateCard(string $cardId, array $attributes): bool
    {
        return Card::where('card_id', $cardId)->update($attributes);
    }

    private function processSetsChunk(array $chunk): array
    {
        $newSets = 0;
        $updatedSets = 0;

        $apiSetNames = collect($chunk)->pluck('name')->toArray();
        $existingSets = Set::whereIn('name', $apiSetNames)->get()->keyBy('name');
        $setsToInsert = [];

        foreach ($chunk as $setData) {
            $setAttributes = [
                'name' => $setData['name'],
                'series' => $setData['series'],
                'printedTotal' => $setData['printedTotal'],
                'total' => $setData['total'],
                'releaseDate' => $setData['releaseDate'] ?? null,
                'symbol_images' => $setData['images']['symbol'] ?? null,
            ];

            $existingSet = $existingSets->get($setData['name']);

            if (!$existingSet) {
                $setAttributes['created_at'] = now();
                $setAttributes['updated_at'] = now();
                $setsToInsert[] = $setAttributes;
                $newSets++;
            } elseif (
                isset($setData['updatedAt']) &&
                $existingSet->updated_at != $setData['updatedAt']
            ) {
                $setAttributes['updated_at'] = now();
                Set::where('id', $existingSet->id)->update($setAttributes);
                $updatedSets++;
            }
        }

        if (!empty($setsToInsert)) {
            $this->bulkInsert(Set::class, $setsToInsert);
        }

        return ['new' => $newSets, 'updated' => $updatedSets];
    }

    private function processCardsChunk(array $chunk, array $setsCache): array
    {
        $newCards = 0;
        $updatedCards = 0;
        $skippedCards = 0;

        $apiCardIds = collect($chunk)->pluck('id')->toArray();
        $existingCards = Card::whereIn('card_id', $apiCardIds)->get()->keyBy('card_id');
        $cardsToInsert = [];

        foreach ($chunk as $cardData) {
            $setName = trim($cardData['set']['name'] ?? '');
            $setId = $setsCache[$setName] ?? null;

            if (!$setId) {
                $skippedCards++;
                continue;
            }

            $cardAttributes = [
                'card_id' => $cardData['id'],
                'name' => $cardData['name'],
                'set_id' => $setId,
                'number' => $cardData['number'],
                'rarity' => $cardData['rarity'] ?? null,
                'nationalPokedexNumbers' => json_encode($cardData['nationalPokedexNumbers'] ?? []),
                'images_small' => $cardData['images']['small'] ?? null,
                'images_large' => $cardData['images']['large'] ?? null,
            ];

            $existingCard = $existingCards->get($cardData['id']);

            if (!$existingCard) {
                $cardAttributes['created_at'] = now();
                $cardAttributes['updated_at'] = now();
                $cardsToInsert[] = $cardAttributes;
                $newCards++;
            } elseif (
                isset($cardData['set']['updatedAt']) &&
                $existingCard->updated_at != $cardData['set']['updatedAt']
            ) {
                $cardAttributes['updated_at'] = now();
                Card::where('id', $existingCard->id)->update($cardAttributes);
                $updatedCards++;
            }
        }

        if (!empty($cardsToInsert)) {
            $this->bulkInsert(Card::class, $cardsToInsert);
        }

        return ['new' => $newCards, 'updated' => $updatedCards, 'skipped' => $skippedCards];
    }

    private function bulkInsert(string $modelClass, array $data): void
    {
        $insertBatchSize = $this->config->getBatchSize('database_insert');
        $insertChunks = array_chunk($data, $insertBatchSize);

        foreach ($insertChunks as $insertChunk) {
            $modelClass::insert($insertChunk);
        }
    }
}
