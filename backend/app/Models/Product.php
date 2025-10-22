<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'stock',
        'seller_id',
        'sales'
    ];

    protected $appends = ['image_url'];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image);
    }
}
