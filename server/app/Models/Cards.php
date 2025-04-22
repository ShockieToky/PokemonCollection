<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

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

    public function set()
    {
        return $this->belongsTo(Set::class);
    }
}