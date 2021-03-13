<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = ["uid", "name", "slug", "layout", "rarity", "type", "text", "flavorText", "vitality", "faceNames", "manaCosts", "subtypes", "legalities", "colors", "keywords", "front", "back"];

    protected $hidden = ["id", "created_at", "updated_at"];

    protected $casts = [
        "vitality" => "array",
        "faceNames" => "array",
        "manaCosts" => "array",
        "subtypes" => "array",
        "colors" => "array",
        "keywords" => "array",
        "legalities" => "array",
    ];
}
