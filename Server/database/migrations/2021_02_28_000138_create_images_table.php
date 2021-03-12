<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateImagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("images", function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string("key")->unique();
            $table->integer("userId");
            $table->integer("width");
            $table->integer("height");
            $table->string("type");
            $table->boolean("deleted")->default(false);
            $table->boolean("private")->default(false);
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
        Schema::dropIfExists("images");
    }
}
