<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Set extends Model
{
    protected $fillable = [
        'name',
        'series',
        'printedTotal',
        'total',
        'releaseDate',
        'symbol_images',
    ];

    protected $casts = [
        'releaseDate' => 'date',
        'symbol_images' => 'string',
    ];

    /**
     * @return HasMany<Card, $this>
     */
    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }
}
