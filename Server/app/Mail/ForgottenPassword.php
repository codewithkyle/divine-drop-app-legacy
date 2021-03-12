<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgottenPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationCode;
    public $name;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(string $code, string $name)
    {
        $this->verificationCode = $code;
        $this->name = $name;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->markdown("emails.user.forgotPasswordEmail", [
            "url" => rtrim(env("APP_URL"), "/") . "/reset-password?code=" . $this->verificationCode,
            "name" => $this->name,
        ])->subject("Password Reset Request");
    }
}
