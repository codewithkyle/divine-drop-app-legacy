<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("files", function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string("key")->unique();
            $table->integer("userId");
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
        Schema::dropIfExists("files");
    }
}
