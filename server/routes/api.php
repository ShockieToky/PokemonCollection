<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Route for fetching all cards
Route::get('/cards', [CardController::class, 'index']);

// Route for adding a card to the collection
Route::post('/cards/{id}/add-to-collection', [CardController::class, 'addToCollection']);

// Route for adding a card to the wishlist
Route::post('/cards/{id}/add-to-wishlist', [CardController::class, 'addToWishlist']);

// Route for fetching the most recent cards
Route::get('/cards/recent', [CardController::class, 'recentCards']);

// Route for searching cards
Route::get('/cards/search', [CardController::class, 'searchCards']);

// Route for fetching all sets
Route::get('/sets', [SetController::class, 'getSets']);

// Route for fetching the most complete set
Route::get('/sets/most-complete', [SetController::class, 'mostComplete']);

// Route for fetching all types
Route::get('/types', [TypeController::class, 'index']);

// Route for fetching pokemons and rarities (search-related)
Route::get('/pokemons', [SearchController::class, 'getPokemons']);
Route::get('/rarities', [SearchController::class, 'getRarities']);