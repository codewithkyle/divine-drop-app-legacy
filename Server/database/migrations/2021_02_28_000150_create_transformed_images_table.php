<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransformedImagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("transformed_images", function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string("key")->unique();
            $table->string("token");
            $table->string("mimeType");
            $table->string("imageId");
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
        Schema::dropIfExists("transformed_images");
    }
}
