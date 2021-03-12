<?php

namespace App\Jobs;

use App\Models\TransformedImage;
use App\Facades\File;

class PurgeTransformedImagesJob extends Job
{
    private $imageId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(string $imageId)
    {
        $this->imageId = $imageId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $images = TransformedImage::where("imageId", $this->imageId)->get();
        foreach ($images as $image) {
            File::Delete($image->key);
            $image->delete();
        }
    }
}
