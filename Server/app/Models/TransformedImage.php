<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransformedImage extends Model
{
    protected $fillable = ["key", "imageId", "uid", "token", "mimeType"];

    protected $hidden = ["id", "created_at", "updated_at", "key", "imageId"];
}
