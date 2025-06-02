<?php

use App\Http\Controllers\CardController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SetController;
use App\Http\Controllers\TypeController;
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

// Route pour récupérer les cartes
Route::get('/cards', [CardController::class, 'index']);

// Route pour récupérer le nombre de cartes dans la collection
Route::get('/cards/collection/count', [CardController::class, 'collectionCardsCount']);

// Route pour récupérer le set le plus complet
Route::get('/sets/most-complete', [SetController::class, 'mostComplete']);

// Route pour récupérer les cartes récentes
Route::get('/cards/recent', [CardController::class, 'recentCards']);

// Route pour rechercher des cartes
Route::get('/cards/search', [CardController::class, 'searchCards']);

// Route pour ajouter une carte à la collection
Route::post('/cards/{id}/add-to-collection', [CardController::class, 'addToCollection']);

// Route pour retirer une carte de la wishlist
Route::post('/cards/{id}/remove-from-wishlist', [CardController::class, 'removeFromWishlist']);

// Route pour ajouter une carte à la wishlist
Route::post('/cards/{id}/add-to-wishlist', [CardController::class, 'addToWishlist']);

// Route pour récupérer les sets
Route::get('/sets', [SetController::class, 'index']);

// Route pour rechercher les pokémons et leurs raretés
Route::get('/pokemons', [SearchController::class, 'getPokemons']);
Route::get('/rarities', [CardController::class, 'getRarities']);

// Route pour récupérer les cartes de la collection
Route::get('/cards/collection', [CardController::class, 'collectionCards']);


// Route for fetching all types
Route::get('/types', [TypeController::class, 'index']);

// Route for fetching cards in the wishlist
Route::get('/cards/wishlist', [CardController::class, 'getWishlistCards']);

// Route for searching cards in the wishlist
Route::get('/cards/wishlist/search', [CardController::class, 'searchWishlist']);

// Route for fetching all cards
Route::get('/cards/total', [CardController::class, 'totalCards']);

// Route for removing a card from the collection
Route::post('/cards/{id}/remove-from-collection', [CardController::class, 'removeFromCollection']);

// Route for fetching the stats of a specific set
Route::get('/sets/{set}/stats', [SetController::class, 'stats']);

Route::get('/rarities', [CardController::class, 'getRaritiesForSetAndPokemon']);

Route::get('/sets/{set}/wishlist-count', [SetController::class, 'wishlistCount']);

Route::get('/sets/{set}/obtained-by-rarity', [SetController::class, 'obtainedByRarity']);

Route::get('/cards/global-stats', [CardController::class, 'globalStats']);

Route::get('/cards/global-obtained-by-rarity', [CardController::class, 'globalObtainedByRarity']);
