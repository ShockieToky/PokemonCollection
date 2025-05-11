<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    protected $fillable = [
        'name',
        'number',
        'set_id',
        'rarity',
        'nationalPokedexNumbers',
        'images_small',
        'images_large',
    ];

    protected $casts = [
        'nationalPokedexNumbers' => 'array',
    ];

    /**
     * @return BelongsTo<Set, $this>
     */
    public function set(): BelongsTo
    {
        return $this->belongsTo(Set::class);
    }
}
