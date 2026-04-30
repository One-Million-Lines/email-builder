<?php
// Minimal image upload endpoint matching the email builder image-uploader plugin protocol.
// Drop into any PHP 8+ web root. Adjust UPLOAD_DIR / PUBLIC_BASE for your deployment.
//
// POST  multipart/form-data, field "file"
// 200   { "url": "/uploads/<name>" }
// 4xx/5xx { "error": "..." }

declare(strict_types=1);

const UPLOAD_DIR  = __DIR__ . '/uploads';
const PUBLIC_BASE = '/uploads';
const MAX_BYTES   = 10 * 1024 * 1024;
const ALLOWED     = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];

header('Content-Type: application/json');
// CORS — restrict in production.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function fail(int $status, string $message): never {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'Method not allowed');
if (empty($_FILES['file'])) fail(400, 'Missing "file" field');

$f = $_FILES['file'];
if ($f['error'] !== UPLOAD_ERR_OK) fail(400, 'Upload error code ' . $f['error']);
if ($f['size'] > MAX_BYTES) fail(413, 'File too large');

// Validate MIME by sniffing the file, not by trusting the client header.
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($f['tmp_name']) ?: '';
if (!isset(ALLOWED[$mime])) fail(415, 'Unsupported image type: ' . $mime);

if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0775, true);
$ext  = ALLOWED[$mime];
$name = bin2hex(random_bytes(12)) . '.' . $ext;
$dest = UPLOAD_DIR . '/' . $name;

if (!move_uploaded_file($f['tmp_name'], $dest)) fail(500, 'Failed to persist file');

echo json_encode(['url' => PUBLIC_BASE . '/' . $name]);
