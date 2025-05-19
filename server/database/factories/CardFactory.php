<?php

/** @noinspection PhpUnnecessaryCurlyVarSyntaxInspection */

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Card;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/** @extends Factory<Card> */
class CardFactory extends Factory
{
    /**
     * @var class-string<Card>
     */
    protected $model = Card::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pokemonNames = [
            'Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mewtwo',
            'Mew', 'Gengar', 'Snorlax', 'Dragonite', 'Gyarados',
            'Lugia', 'Ho-Oh', 'Tyranitar', 'Rayquaza', 'Lucario',
            'Garchomp', 'Greninja', 'Sylveon', 'Mimikyu', 'Zacian',
        ];

        $rarities = [
            'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra',
            'Rare Holo V', 'Rare Holo VMAX', 'Rare Rainbow', 'Rare Secret',
            'Rare Shiny', 'Rare Promo', 'Rare BREAK', 'Rare ACE', 'Rare GX',
        ];

        $pokedexNumber = $this->faker->numberBetween(1, 1010);
        /** @var string $name */
        $name = $this->faker->randomElement($pokemonNames);

        if ($this->faker->boolean(30)) {
            /** @var string $str */
            $str = $this->faker->randomElement(['V', 'VMAX', 'GX', 'EX', 'VSTAR']);
            $name .= " {$str}";
        }

        return [
            'name' => $name,
            'number' => $this->faker->unique()->numberBetween(1, 300),
            'set_id' => $this->faker->numberBetween(1, 10),
            'rarity' => $this->faker->randomElement($rarities),
            'nationalPokedexNumbers' => $pokedexNumber,
            'images_small' => "https://example.com/cards/small/{$pokedexNumber}.jpg",
            'images_large' => "https://example.com/cards/large/{$pokedexNumber}.jpg",
            //            'obtained' => $this->faker->boolean(),
            //            'obtained_at' => function (array $attributes) {
            //                return $attributes['obtained'] ? Carbon::now()->subDays($this->faker->numberBetween(1, 100)) : null;
            //            },
            //            'wishlisted' => $this->faker->boolean(20),
            'created_at' => Carbon::now()->subDays($this->faker->numberBetween(1, 365)),
            'updated_at' => Carbon::now()->subDays($this->faker->numberBetween(0, 30)),
        ];
    }
    //
    //    /**
    //     * Configure the model factory to create a card that is obtained.
    //     *
    //     * @return CardFactory
    //     */
    //    public function obtained(): self
    //    {
    //        return $this->state(function () {
    //            return [
    //                'obtained' => true,
    //                'obtained_at' => Carbon::now()->subDays($this->faker->numberBetween(1, 100)),
    //            ];
    //        });
    //    }
    //
    //    /**
    //     * Configure the model factory to create a card that is not obtained.
    //     *
    //     * @return CardFactory
    //     */
    //    public function notObtained(): self
    //    {
    //        return $this->state(function () {
    //            return [
    //                'obtained' => false,
    //                'obtained_at' => null,
    //            ];
    //        });
    //    }
    //
    //    /**
    //     * Configure the model factory to create a card that is wishlisted.
    //     *
    //     * @return CardFactory
    //     */
    //    public function wishlisted(): self
    //    {
    //        return $this->state(function () {
    //            return [
    //                'wishlisted' => true,
    //            ];
    //        });
    //    }

    /**
     * Configure the model factory to create a card with a specific rarity.
     */
    public function withRarity(string $rarity): self
    {
        return $this->state(function () use ($rarity) {
            return [
                'rarity' => $rarity,
            ];
        });
    }

    /**
     * Configure the model factory to create a card from a specific set.
     */
    public function inSet(int $setId): self
    {
        return $this->state(function () use ($setId) {
            return [
                'set_id' => $setId,
            ];
        });
    }

    /**
     * Configure the model factory to create a card with a specific name.
     */
    public function named(string $name): self
    {
        return $this->state(function () use ($name) {
            return [
                'name' => $name,
            ];
        });
    }

    //    /**
    //     * Configure the model factory to create a recently obtained card.
    //     *
    //     * @return CardFactory
    //     */
    //    public function recentlyObtained(): self
    //    {
    //        return $this->state(function () {
    //            return [
    //                'obtained' => true,
    //                'obtained_at' => Carbon::now()->subDays($this->faker->numberBetween(0, 7)),
    //            ];
    //        });
    //    }
}
