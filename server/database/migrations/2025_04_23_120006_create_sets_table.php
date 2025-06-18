<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSetsTable extends Migration
{
    /** Faire la migration */
    public function up(): void
    {
        Schema::create('sets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('series');
            $table->integer('printedTotal');
            $table->integer('total');
            $table->date('releaseDate')->nullable();
            $table->string('symbol_images')->nullable();
            $table->timestamps();
        });
    }

    /** annuler la migration */
    public function down(): void
    {
        Schema::dropIfExists('sets');
    }
}
