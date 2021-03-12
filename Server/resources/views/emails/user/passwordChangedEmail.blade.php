@component('mail::message')
# Hey {{ $name }},

Your password was changed. If this was done by you then there's nothing to do nor worry about.

However, if you were unaware of this change, please [contact us]({{ $supportEmail }}) if you need help or have questions.

<br>

---

<br>
<br>

## Why are we sending you this?

We take security very seriously and we want to keep you in the loop on important actions in your account.

@endcomponent
