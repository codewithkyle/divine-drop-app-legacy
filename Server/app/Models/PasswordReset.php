<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    protected $fillable = ["emailVerificationCode", "userId"];

    protected $hidden = ["emailVerificationCode", "userId"];
}
