<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerification extends Model
{
    protected $fillable = ["emailVerificationCode", "userId", "email"];

    protected $hidden = ["emailVerificationCode", "userId", "email"];
}
