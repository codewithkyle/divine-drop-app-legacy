<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordChanged extends Mailable
{
    use Queueable, SerializesModels;

    public $name;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public function build()
    {
        return $this->markdown("emails.user.passwordChangedEmail", [
            "supportEmail" => "mailto:" . env("EMAIL_SUPPORT"),
            "name" => $this->name,
        ])->subject("Your Password Changed");
    }
}
