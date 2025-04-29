<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;

class cardController extends Controller
{
    // Controller pour gérer les cartes.
    public function index()
    {
        $cards = Card::all();
        return response()->json($cards);
    }

    // Ajoute une nouvelle carte
    public function store(Request $request)
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
    public function show($id)
    {
        $card = Card::findOrFail($id);
        return response()->json($card);
    }

    // Met à jour une carte par son ID
    public function update(Request $request, $id)
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
    public function destroy($id)
    {
        $card = Card::findOrFail($id);
        $card->delete();
        return response()->json(['message' => 'Card deleted successfully']);
    }

    // Affiche le nombre total de cartes
    public function totalCards()
    {
        $total = Card::count();

        return response()->json([
            'total' => $total,
        ]);
    }

    // Affiche les 6 cartes les plus récentes
    public function recentCards()
    {
        $recentCards = Card::whereNotNull('obtained_at')
            ->orderBy('obtained_at', 'desc')
            ->take(6)
            ->get();

        return response()->json($recentCards);
    }

    // Recherche des cartes par différents critères
    public function searchCards(Request $request)
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
    
    public function addToCollection($id)
    {
        $card = Card::findOrFail($id);
        $card->obtained = true;
        $card->obtained_at = now();
        $card->save();

        return response()->json(['message' => 'Card added to collection successfully']);
    }

    public function addToWishlist($id)
    {
        $card = Card::findOrFail($id);
        $card->whislisted = true;
        $card->save();

        return response()->json(['message' => 'Card added to wishlist successfully']);
    }
}