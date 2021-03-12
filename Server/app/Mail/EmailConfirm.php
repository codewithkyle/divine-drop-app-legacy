<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailConfirm extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationCode;
    public $fullName;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(string $code, string $fullName)
    {
        $this->verificationCode = $code;
        $this->fullName = $fullName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->markdown("emails.user.confirmEmail", [
            "url" => rtrim(env("API_URL"), "/") . "/v1/verify-email?code=" . $this->verificationCode,
            "verificationCode" => $this->verificationCode,
            "name" => $this->fullName,
        ])->subject("Confirm Email Address");
    }
}
