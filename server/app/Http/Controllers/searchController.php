<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\Set;

class SearchController extends Controller
{
    // Récupération des sets
    public function getSets()
    {
        $sets = Set::all();
        return response()->json($sets);
    }

    // Récupération des pokemons d'un set
    public function getPokemons(Request $request)
    {
        $setId = $request->query('set_id');
        $pokemons = Card::where('set_id', $setId)
            ->select('name')
            ->distinct()
            ->get();

        return response()->json($pokemons);
    }

    // Récupérer les raretés d'un pokemon
    public function getRarities(Request $request)
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