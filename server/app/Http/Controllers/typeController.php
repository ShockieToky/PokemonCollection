<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Type;

class TypeController extends Controller
{
    // List all types
    public function index()
    {
        $types = Type::all();
        return response()->json($types);
    }

    // Store a new type
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $type = Type::create($validatedData);
        return response()->json($type, 201);
    }

    // Show a specific type by ID
    public function show($id)
    {
        $type = Type::findOrFail($id);
        return response()->json($type);
    }

    // Update an existing type
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        $type = Type::findOrFail($id);
        $type->update($validatedData);
        return response()->json($type);
    }

    // Delete a specific type by ID
    public function destroy($id)
    {
        $type = Type::findOrFail($id);
        $type->delete();
        return response()->json(['message' => 'Type deleted successfully']);
    }
}