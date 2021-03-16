<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deck extends Model
{
    protected $fillable = ["uid", "name", "userId", "cards", "commander"];

    protected $hidden = ["id", "userId", "created_at", "updated_at"];

    protected $casts = [
        "cards" => "array",
    ];
}
