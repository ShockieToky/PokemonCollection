<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCardsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('number');
            $table->foreignId('set_id')->constrained()->cascadeOnDelete();
            $table->string('rarity');
            $table->string('nationalPokedexNumbers')->nullable();
            $table->string('images_small');
            $table->string('images_large');
            $table->date('obtained_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
}
