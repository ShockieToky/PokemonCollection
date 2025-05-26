<?php

namespace App\Http\Controllers;

use App\Models\Set;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SetController extends Controller
{
    // liste de tous les sets
    public function index(): JsonResponse
    {
        $sets = Set::all();

        return response()->json($sets);
    }

    // Ajouter un nouveau set
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'series' => 'required|string|max:255',
            'printedTotal' => 'required|integer',
            'total' => 'required|integer',
            'releaseDate' => 'required|date',
            'symbol_images' => 'required|url',
        ]);

        $set = Set::create($validatedData);

        return response()->json($set, 201);
    }

    // Montrer un set spécifique par ID
    public function show(int $id): JsonResponse
    {
        $set = Set::findOrFail($id);

        return response()->json($set);
    }

    // Mettre à jour un set spécifique par ID
    public function update(Request $request, int $id): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'series' => 'sometimes|string|max:255',
            'printedTotal' => 'sometimes|integer',
            'total' => 'sometimes|integer',
            'releaseDate' => 'sometimes|date',
            'symbol_images' => 'sometimes|url',
        ]);

        $set = Set::findOrFail($id);
        $set->update($validatedData);

        return response()->json($set);
    }

    // Supprimer un set spécifique par ID
    public function destroy(int $id): JsonResponse
    {
        $set = Set::findOrFail($id);
        $set->delete();

        return response()->json(['message' => 'Set deleted successfully']);
    }

    // Obtenir le set le plus complet
    public function mostComplete(): \Illuminate\Http\JsonResponse
    {
        // Get all sets
        $sets = \App\Models\Set::withCount(['cards as total_cards', 'cards as obtained_cards' => function ($query) {
            $query->where('obtained', true);
        }])->get();

        // Calculate completion % for each set
        $sets = $sets->map(function ($set) {
            $set->completion = $set->total_cards > 0 ? round(($set->obtained_cards / $set->total_cards) * 100, 2) : 0;
            $set->remaining = $set->total_cards - $set->obtained_cards;
            return $set;
        });

        // Get the set with the highest completion %
        $mostComplete = $sets->sortByDesc('completion')->first();

        return response()->json($mostComplete);
    }

    public function stats($setId)
    {
        // Total cards in the set
        $total = \App\Models\Card::where('set_id', $setId)->count();

        // Cards obtained in the set
        $obtained = \App\Models\Card::where('set_id', $setId)
            ->where('obtained', true)
            ->count();

        // Cards not obtained
        $notObtained = $total - $obtained;

        // Percent completed
        $percent = $total > 0 ? round(($obtained / $total) * 100, 2) : 0;

        return response()->json([
            'percent_completed' => $percent,
            'cards_obtained' => $obtained,
            'cards_not_obtained' => $notObtained,
        ]);
    }

    public function wishlistCount($setId)
    {
        $count = \App\Models\Card::where('set_id', $setId)
            ->where('wishlisted', true)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function obtainedByRarity($setId)
    {
        $rarities = \App\Models\Card::where('set_id', $setId)
            ->select('rarity')
            ->distinct()
            ->pluck('rarity');

        $result = [];
        foreach ($rarities as $rarity) {
            $total = \App\Models\Card::where('set_id', $setId)
                ->where('rarity', $rarity)
                ->count();
            $obtained = \App\Models\Card::where('set_id', $setId)
                ->where('rarity', $rarity)
                ->where('obtained', true)
                ->count();
            $result[] = [
                'rarity' => $rarity,
                'obtained' => $obtained,
                'total' => $total,
            ];
        }

        return response()->json($result);
    }
}
