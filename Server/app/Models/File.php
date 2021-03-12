<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    protected $fillable = ["key", "userId", "uid"];

    protected $hidden = ["id", "created_at", "updated_at", "key", "userId"];
}
