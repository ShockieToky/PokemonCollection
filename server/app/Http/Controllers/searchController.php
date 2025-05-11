<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Set;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    // Récupération des sets
    public function getSets(): JsonResponse
    {
        $sets = Set::all();

        return response()->json($sets);
    }

    // Récupération des pokemons d'un set
    public function getPokemons(Request $request): JsonResponse
    {
        $setId = $request->query('set_id');
        $pokemons = Card::where('set_id', $setId)
            ->select('name')
            ->distinct()
            ->get();

        return response()->json($pokemons);
    }

    // Récupérer les raretés d'un pokemon
    public function getRarities(Request $request): JsonResponse
    {
        $setId = $request->query('set_id');
        $pokemon = $request->query('pokemon');
        $rarities = Card::where('set_id', $setId)
            ->where('name', $pokemon)
            ->select('rarity')
            ->distinct()
            ->pluck('rarity');

        return response()->json($rarities);
    }
}
