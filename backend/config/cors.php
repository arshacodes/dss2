<?php

return [
    'paths' => ['api/*', 'login', 'logout', 'register', 'sanctum/csrf-cookie'],
    // 'paths' => ['api/*', 'sanctum/csrf-cookie'],
    // 'paths' => ['*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];