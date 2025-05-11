<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    // Controller pour gérer les cartes.
    public function index(): JsonResponse
    {
        $cards = Card::all();

        return response()->json($cards);
    }

    // Ajoute une nouvelle carte
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'number' => 'required|string|max:50',
            'set_id' => 'required|integer|exists:sets,id',
            'rarity' => 'required|string|max:50',
            'nationalPokedexNumbers' => 'nullable|array',
            'images_small' => 'required|url',
            'images_large' => 'required|url',
        ]);

        $card = Card::create($validatedData);

        return response()->json($card, 201);
    }

    // Affiche une carte par son ID
    public function show(int $id): JsonResponse
    {
        $card = Card::findOrFail($id);

        return response()->json($card);
    }

    // Met à jour une carte par son ID
    public function update(Request $request, int $id): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'number' => 'sometimes|string|max:50',
            'set_id' => 'sometimes|integer|exists:sets,id',
            'rarity' => 'sometimes|string|max:50',
            'nationalPokedexNumbers' => 'nullable|array',
            'images_small' => 'sometimes|url',
            'images_large' => 'sometimes|url',
        ]);

        $card = Card::findOrFail($id);
        $card->update($validatedData);

        return response()->json($card);
    }

    // Supprime une carte par son ID
    public function destroy(int $id): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }

    // Affiche le nombre total de cartes
    public function totalCards(): JsonResponse
    {
        $total = Card::count();

        return response()->json([
            'total' => $total,
        ]);
    }

    // Affiche les 6 cartes les plus récentes
    public function recentCards(): JsonResponse
    {
        $recentCards = Card::whereNotNull('obtained_at')
            ->orderBy('obtained_at', 'desc')
            ->take(6)
            ->get();

        return response()->json($recentCards);
    }

    // Recherche des cartes par différents critères
    public function searchCards(Request $request): JsonResponse
    {
        $query = Card::query();

        if ($request->has('set_id')) {
            $query->where('set_id', $request->query('set_id'));
        }

        if ($request->has('pokemon')) {
            $query->where('name', $request->query('pokemon'));
        }

        if ($request->has('rarity')) {
            $query->where('rarity', $request->query('rarity'));
        }

        $cards = $query->get();

        return response()->json($cards);
    }

    public function addToCollection(int $id): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->obtained = true;
        $card->obtained_at = now();
        $card->save();

        return response()->json(['message' => 'Card added to collection successfully']);
    }

    public function addToWishlist(int $id): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->wishlisted = true;
        $card->save();

        return response()->json(['message' => 'Card added to wishlist successfully']);
    }

    public function getWishlistCards(Request $request): JsonResponse
    {
        $cards = Card::where('wishlisted', true)
            ->paginate(18); // 18 cards per page

        return response()->json($cards);
    }

    public function searchWishlist(Request $request): JsonResponse
    {
        $query = Card::where('wishlisted', true);

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->query('name') . '%');
        }

        if ($request->has('set')) {
            $query->where('set_id', $request->query('set'));
        }

        if ($request->has('rarity')) {
            $query->where('rarity', $request->query('rarity'));
        }

        $cards = $query->get();

        return response()->json($cards);
    }

    public function getRarities(): JsonResponse
    {
        $rarities = Card::select('rarity')->distinct()->pluck('rarity');

        return response()->json($rarities);
    }
}
