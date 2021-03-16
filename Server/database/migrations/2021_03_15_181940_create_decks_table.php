<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDecksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("decks", function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->integer("userId");
            $table->string("name");
            $table
                ->string("commander")
                ->nullable()
                ->default(null);
            $table->json("cards");
            $table->uuid("uid");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists("decks");
    }
}
