<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TypeController extends Controller
{
    // List all types
    public function index(): JsonResponse
    {
        $types = Type::all();

        return response()->json($types);
    }

    // Store a new type
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $type = Type::create($validatedData);

        return response()->json($type, 201);
    }

    // Show a specific type by ID
    public function show(int $id): JsonResponse
    {
        $type = Type::findOrFail($id);

        return response()->json($type);
    }

    // Update an existing type
    public function update(Request $request, int $id): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        $type = Type::findOrFail($id);
        $type->update($validatedData);

        return response()->json($type);
    }

    // Delete a specific type by ID
    public function destroy(int $id): JsonResponse
    {
        $type = Type::findOrFail($id);
        $type->delete();

        return response()->json(['message' => 'Type deleted successfully']);
    }
}
