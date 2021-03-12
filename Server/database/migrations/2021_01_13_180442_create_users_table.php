<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("users", function (Blueprint $table) {
            $table->increments("id")->autoIncrement();
            $table->string("email")->unique();
            $table->string("name");
            $table->string("password");
            $table->uuid("uid");
            $table->boolean("admin")->default(false);
            $table->boolean("verified")->default(false);
            $table->boolean("suspended")->default(false);
            $table->string("avatar")->nullable();
            $table->json("groups");
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
        Schema::dropIfExists("users");
    }
}
