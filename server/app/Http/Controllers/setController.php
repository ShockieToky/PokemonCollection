<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Set;

class SetController extends Controller
{
    // List all sets
    public function index()
    {
        $sets = Set::all();
        return response()->json($sets);
    }

    // Store a new set
    public function store(Request $request)
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

    // Show a specific set by ID
    public function show($id)
    {
        $set = Set::findOrFail($id);
        return response()->json($set);
    }

    // Update an existing set
    public function update(Request $request, $id)
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

    // Delete a specific set by ID
    public function destroy($id)
    {
        $set = Set::findOrFail($id);
        $set->delete();
        return response()->json(['message' => 'Set deleted successfully']);
    }
}