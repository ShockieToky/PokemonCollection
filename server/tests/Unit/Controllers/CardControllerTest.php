<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\CardController;
use App\Models\Card;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;

class CardControllerTest extends TestCase
{
    use RefreshDatabase;

    private CardController $cardController;

    /**
     * @var array<string, mixed>
     */
    private array $defaultCardData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cardController = new CardController();

        // Define common card data to reuse across tests
        $this->defaultCardData = [
            'name' => 'Test Card',
            'number' => '123',
            'set_id' => 1,
            'rarity' => 'Common',
            'nationalPokedexNumbers' => [123],
            'images_small' => 'https://example.com/small.jpg',
            'images_large' => 'https://example.com/large.jpg',
        ];
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // Group 1: Read Operations
    public function test_index(): void
    {
        // Create all test cards at once
        Card::factory()->count(3)->create();

        $response = $this->cardController->index();

        $this->assertEquals(200, $response->getStatusCode());
        $content = $response->getContent();
        $this->assertIsString($content);
        $data = json_decode($content, true);
        $this->assertIsArray($data);
        $this->assertCount(3, $data);
    }

    public function test_show(): void
    {
        $card = Card::factory()->create([
            'name' => 'Charizard',
            'number' => '6',
        ]);

        $response = $this->cardController->show($card->id);

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('name', $responseData);
        $this->assertEquals('Charizard', $responseData['name']);
    }

    public function test_total_cards(): void
    {
        Card::factory()->count(5)->create();

        $response = $this->cardController->totalCards();

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('total', $responseData);
        $this->assertEquals(5, $responseData['total']);
    }

    public function test_recent_cards(): void
    {
        Card::factory()->count(10)->create([
            'obtained_at' => now(),
        ]);

        $response = $this->cardController->recentCards();

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertCount(6, $responseData);
    }

    public function test_get_rarities(): void
    {
        // Create all cards with different rarities in a single batch
        Card::factory()->create(['rarity' => 'Common']);
        Card::factory()->create(['rarity' => 'Rare']);
        Card::factory()->create(['rarity' => 'Ultra Rare']);
        Card::factory()->create(['rarity' => 'Common']); // Duplicate

        $response = $this->cardController->getRarities();

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertCount(3, $responseData);
        $this->assertContains('Common', $responseData);
        $this->assertContains('Rare', $responseData);
        $this->assertContains('Ultra Rare', $responseData);
    }

    // Group 2: Write Operations
    public function test_store(): void
    {
        $request = $this->createMockRequest($this->defaultCardData, 'POST');

        $response = $this->cardController->store($request);

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertDatabaseHas('cards', [
            'name' => $this->defaultCardData['name'],
            'number' => $this->defaultCardData['number'],
        ]);
    }

    public function test_update(): void
    {
        $card = Card::factory()->create([
            'name' => 'Charizard',
            'number' => '6',
        ]);

        $updateData = [
            'name' => 'Charizard V',
            'rarity' => 'Ultra Rare',
        ];

        $request = $this->createMockRequest($updateData, 'PUT');

        $response = $this->cardController->update($request, $card->id);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'name' => 'Charizard V',
            'rarity' => 'Ultra Rare',
        ]);
    }

    public function test_destroy(): void
    {
        $card = Card::factory()->create();

        $response = $this->cardController->destroy($card->id);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseMissing('cards', ['id' => $card->id]);

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('message', $responseData);
        $this->assertEquals('Card deleted successfully', $responseData['message']);
    }

    // Group 3: Collection Operations
    public function test_add_to_collection(): void
    {
        $card = Card::factory()->create([
            'obtained' => false,
            'obtained_at' => null,
        ]);

        $response = $this->cardController->addToCollection($card->id);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'obtained' => true,
        ]);

        $updatedCard = Card::query()->find($card->id);
        $this->assertNotNull($updatedCard);
        $this->assertNotNull($updatedCard->obtained_at);
    }

    public function test_add_to_wishlist(): void
    {
        $card = Card::factory()->create([
            'wishlisted' => false,
        ]);

        $response = $this->cardController->addToWishlist($card->id);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'wishlisted' => true,
        ]);
    }

    // Group 4: Search and Filter Operations
    public function test_search_cards(): void
    {
        // Create cards for search test in a single batch
        Card::factory()->create([
            'name' => 'Pikachu',
            'set_id' => 1,
            'rarity' => 'Common',
        ]);

        Card::factory()->create([
            'name' => 'Charizard',
            'set_id' => 2,
            'rarity' => 'Rare',
        ]);

        $request = $this->createMockRequest([
            'set_id' => 1,
            'pokemon' => 'Pikachu',
            'rarity' => 'Common',
        ]);

        $response = $this->cardController->searchCards($request);

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertCount(1, $responseData);
        $this->assertArrayHasKey(0, $responseData);
        $this->assertIsArray($responseData[0]);
        $this->assertArrayHasKey('name', $responseData[0]);
        $this->assertEquals('Pikachu', $responseData[0]['name']);
    }

    public function test_get_wishlist_cards(): void
    {
        // Create wishlisted and non-wishlisted cards at once
        Card::factory()->count(20)->create(['wishlisted' => true]);
        Card::factory()->count(5)->create(['wishlisted' => false]);

        $request = $this->createMockRequest();

        $response = $this->cardController->getWishlistCards($request);

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertArrayHasKey('per_page', $responseData);
        $this->assertArrayHasKey('total', $responseData);
        $this->assertEquals(18, $responseData['per_page']); // 18 cards per page
        $this->assertEquals(20, $responseData['total']); // 20 total wishlisted cards
    }

    public function test_search_wishlist(): void
    {
        // Create all test cards at once
        Card::factory()->create([
            'name' => 'Pikachu',
            'set_id' => 1,
            'rarity' => 'Common',
            'wishlisted' => true,
        ]);

        Card::factory()->create([
            'name' => 'Charizard',
            'set_id' => 2,
            'rarity' => 'Rare',
            'wishlisted' => true,
        ]);

        Card::factory()->create([
            'name' => 'Blastoise',
            'set_id' => 3,
            'rarity' => 'Rare',
            'wishlisted' => false,
        ]);

        $request = $this->createMockRequest([
            'name' => 'Pikachu',
            'set' => 1,
            'rarity' => 'Common',
        ]);

        $response = $this->cardController->searchWishlist($request);

        $this->assertEquals(200, $response->getStatusCode());

        $content = $response->getContent();
        $this->assertIsString($content);
        $responseData = json_decode($content, true);
        $this->assertIsArray($responseData);
        $this->assertCount(1, $responseData);
        $this->assertArrayHasKey(0, $responseData);
        $this->assertIsArray($responseData[0]);
        $this->assertArrayHasKey('name', $responseData[0]);
        $this->assertEquals('Pikachu', $responseData[0]['name']);
    }

    /**
     * Helper method to create a mock request.
     *
     * @param array<string, mixed> $data
     *
     * @return MockInterface&Request
     */
    private function createMockRequest(array $data = [], string $method = 'GET'): Request
    {
        /** @var MockInterface&Request $request */
        $request = Mockery::mock(Request::class);

        $request->expects('all')->andReturn($data);

        if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $request->expects('validate')->withAnyArgs()->andReturn($data);
        }

        $request->expects('setMethod')->with($method)->andReturn($request);

        return $request;
    }
}
