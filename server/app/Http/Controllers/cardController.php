<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    // Controller pour gérer les cartes.
    public function index(Request $request)
    {
        $query = Card::query();

        if ($request->has('set')) {
            $query->where('set_id', $request->query('set'));
        }
        if ($request->has('name')) {
            $query->where('name', $request->query('name'));
        }
        if ($request->has('rarity')) {
            $query->where('rarity', $request->query('rarity'));
        }
        
        return response()->json($query->get());
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

    public function collectionCardsCount(): \Illuminate\Http\JsonResponse
    {
        // Compte le nombre de cartes obtenues
        $total = Card::where('obtained', true)->count();
        // Retourne le total en JSON
        return response()->json(['total' => $total]);
    }

    // Affiche les 6 cartes les plus récentes
    public function recentCards(): \Illuminate\Http\JsonResponse
    {
        $cards = \App\Models\Card::where('obtained', true)
            // ordre par date d'obtention décroissante
            ->orderByDesc('obtained_at')
            // limite à 6 cartes
            ->limit(6)
            ->get();
        return response()->json($cards);
    }

    // Recherche des cartes par différents critères
    public function searchCards(Request $request): JsonResponse
    {
        $query = Card::query();
        if ($request->has('set_id')) {
            // Filtre par set_id
            $query->where('set_id', $request->query('set_id'));
        }

        if ($request->has('pokemon')) {
            // Filtre par nom de Pokémon
            $query->where('name', $request->query('pokemon'));
        }

        if ($request->has('rarity')) {
            // Filtre par rareté
            $query->where('rarity', $request->query('rarity'));
        }

        // Retourne les cartes filtrées
        $cards = $query->get();
        return response()->json($cards);
    }

    // Ajoute une carte à la collection
    public function addToCollection(int $id): JsonResponse
    {
        // Trouve la carte par son ID
        $card = Card::findOrFail($id);
        // Ajoute la carte à la collection
        $card->obtained = true;
        // Définit la date d'obtention à maintenant
        $card->obtained_at = now();
        // Enregistre les modifications
        $card->save();
        // Retourne une réponse JSON
        return response()->json(['message' => 'Card ajouté à la collection avec succès']);
    }

    // Retire une carte de la wishlist
    public function removeFromWishlist(int $id): \Illuminate\Http\JsonResponse
    {
        // Trouve la carte par son ID
        $card = Card::findOrFail($id);
        // Met à jour le champ wishlisted à false
        $card->wishlisted = false;
        // Enregistre les modifications
        $card->save();
        // Retourne une réponse JSON
        return response()->json(['message' => 'Card removed from wishlist']);
    }

    // Ajoute une carte à la wishlist
    public function addToWishlist(int $id): JsonResponse
    {
        // Trouve la carte par son ID
        $card = Card::findOrFail($id);
        // Met à jour le champ wishlisted à true
        $card->wishlisted = true;
        // Enregistre les modifications
        $card->save();
        // Retourne une réponse JSON
        return response()->json(['message' => 'Card added to wishlist successfully']);
    }

    // Récupère la rareté des cartes
    public function getRarities(): JsonResponse
    {
        // Sélectionne les raretés distinctes des cartes
        $rarities = Card::select('rarity')->distinct()->pluck('rarity');
        // Retourne les raretés en JSON
        return response()->json($rarities);
    }

    // Récupère les cartes de la wishlist avec des options de filtrage et de tri
    public function getWishlistCards(Request $request): JsonResponse
    {
        $query = Card::where('wishlisted', true);

        if ($request->has('name') && $request->query('name') !== '') {
            $query->where('name', 'like', '%' . $request->query('name') . '%');
        }
        if ($request->has('set') && $request->query('set') !== '') {
            $query->where('set_id', $request->query('set'));
        }
        if ($request->has('rarity') && $request->query('rarity') !== '') {
            $query->where('rarity', $request->query('rarity'));
        }

        // gestion de tri
        if ($request->has('sort')) {
            switch ($request->query('sort')) {
                case 'name-asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'set-asc':
                    // Utilisation d'une jointure avec la table des sets pour trier par date de sortie du set ascendant
                    $query->join('sets', 'cards.set_id', '=', 'sets.id')
                        ->orderBy('sets.releaseDate', 'asc')
                        ->select('cards.*');
                    break;
                case 'set-desc':
                    // Utilisation d'une jointure avec la table des sets pour trier par date de sortie du set descendant
                    $query->join('sets', 'cards.set_id', '=', 'sets.id')
                        ->orderBy('sets.releaseDate', 'desc')
                        ->select('cards.*');
                    break;
            }
        }

        // Utilise le paramètre perPage du front, sinon 21 par défaut
        $perPage = $request->query('perPage');

        // Pagination des résultats, 21 cartes par page
        $cards = $query->paginate($perPage);
        // Retourne les cartes de la wishlist en JSON
        return response()->json($cards);
    }

    // Recherche des cartes dans la wishlist avec des options de filtrage
    public function searchWishlist(Request $request): JsonResponse
    {
        $query = Card::where('wishlisted', true);

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->query('name') . '%'); // Filtre les cartes par nom
        }

        if ($request->has('set')) {
            $query->where('set_id', $request->query('set')); // Filtre les cartes par set_id
        }

        if ($request->has('rarity')) {
            $query->where('rarity', $request->query('rarity')); // Filtre les cartes par rareté
        }

        $cards = $query->get();

        return response()->json($cards);
    }

    public function totalCards(): JsonResponse
    {
        $total = \App\Models\Card::count();
        return response()->json(['total' => $total]);
    }

    // Récupère les cartes de la collection avec des options de filtrage et de tri
    public function collectionCards(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Card::where('obtained', true);

        if ($request->has('name') && $request->query('name') !== '') { // Vérifie si le paramètre 'name' est présent et non vide
            $query->where('name', 'like', '%' . $request->query('name') . '%'); // Filtre les cartes par nom
        }
        if ($request->has('set') && $request->query('set') !== '') { // Vérifie si le paramètre 'set' est présent et non vide
            $query->where('set_id', $request->query('set')); // Filtre les cartes par set_id
        }
        if ($request->has('rarity') && $request->query('rarity') !== '') {  // Vérifie si le paramètre 'rarity' est présent et non vide
            $query->where('rarity', $request->query('rarity')); // Filtre les cartes par rareté
        }

        // Gestion du tri des cartes
        if ($request->has('sort')) {
            switch ($request->query('sort')) {
                case 'name-asc': // Tri par nom de carte en ordre ascendant
                    $query->orderBy('name', 'asc');
                    break;
                case 'set-asc': // Tri par date de sortie du set en ordre ascendant
                    $query->join('sets', 'cards.set_id', '=', 'sets.id') // Jointure avec la table des sets
                        ->orderBy('sets.releaseDate', 'asc')
                        ->select('cards.*');
                    break;
                case 'set-desc': // Tri par date de sortie du set en ordre descendant
                    $query->join('sets', 'cards.set_id', '=', 'sets.id') // Jointure avec la table des sets
                        ->orderBy('sets.releaseDate', 'desc')
                        ->select('cards.*');
                    break;
            }
        }

        // Utilise le paramètre perPage du front
        $perPage = $request->query('perPage');
        $cards = $query->paginate($perPage);

        return response()->json($cards);
    }

    // Retire une carte de la collection
    public function removeFromCollection(int $id): \Illuminate\Http\JsonResponse
    {
        $card = Card::findOrFail($id); // Trouve la carte par son ID
        $card->obtained = false; // Met à jour le champ 'obtained' à false
        $card->obtained_at = null; // Réinitialise la date d'obtention
        $card->save(); // Enregistre les modifications

        // Retourne une réponse JSON indiquant que la carte a été retirée de la collection
        return response()->json(['message' => 'Cartes retirée de la collection avec succès']);
    }

    public function getRaritiesForSetAndPokemon(\Illuminate\Http\Request $request)
    {
        $setId = $request->query('set_id');
        $pokemon = $request->query('pokemon');

        $query = \App\Models\Card::query();

        if ($setId) {
            $query->where('set_id', $setId);
        }
        if ($pokemon) {
            $query->where('name', $pokemon);
        }

        $rarities = $query->distinct()->pluck('rarity')->filter()->values();

        return response()->json($rarities);
    }

    public function globalStats()
    {
        $total = \App\Models\Card::count();
        $obtained = \App\Models\Card::where('obtained', true)->count();
        $notObtained = $total - $obtained;
        $percent = $total > 0 ? round($obtained / $total * 100, 2) : 0;
        return response()->json([
            'cards_obtained' => $obtained,
            'cards_not_obtained' => $notObtained,
            'percent_completed' => $percent,
        ]);
    }

public function globalObtainedByRarity()
    {
        $rarities = \App\Models\Card::select('rarity')->distinct()->pluck('rarity');
        $result = [];
        foreach ($rarities as $rarity) {
            $total = \App\Models\Card::where('rarity', $rarity)->count();
            $obtained = \App\Models\Card::where('rarity', $rarity)->where('obtained', true)->count();
            $result[] = [
                'rarity' => $rarity,
                'obtained' => $obtained,
                'total' => $total,
            ];
        }
        return response()->json($result);
    }
}
