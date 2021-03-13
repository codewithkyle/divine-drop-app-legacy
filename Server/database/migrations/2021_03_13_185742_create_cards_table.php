<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCardsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("cards", function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string("name");
            $table->string("slug");
            $table->uuid("uid");
            $table->string("layout");
            $table->string("rarity");
            $table->string("type");
            $table->text("text");
            $table->text("flavorText");
            $table->json("vitality");
            $table->json("faceNames");
            $table->json("manaCosts");
            $table->json("subtypes");
            $table->json("legalities");
            $table->json("colors");
            $table->json("keywords");
            $table->string("front");
            $table
                ->string("back")
                ->nullable()
                ->default(null);
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
        Schema::dropIfExists("cards");
    }
}
