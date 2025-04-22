<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Set extends Model
{
    use HasFactory;

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

    public function cards()
    {
        return $this->hasMany(Card::class);
    }
}