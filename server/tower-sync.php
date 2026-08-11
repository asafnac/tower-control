<?php
/**
 * tower-sync.php — the whole sync server for מגדל הפיקוח.
 *
 * INSTALL
 *   1. Copy this one file anywhere under your web root, e.g. /var/www/html/
 *   2. Make sure the folder is writable by the web server:
 *        sudo mkdir -p /var/www/html/tower-sync-data
 *        sudo chown www-data:www-data /var/www/html/tower-sync-data
 *   3. Put the resulting https:// URL into the game's parent screen.
 *
 * That is the entire deployment. No database, no framework, no composer.
 *
 * WHAT IT DOES
 *   GET  ?code=XXXX  → the save stored under that code, or {} if there is none
 *   POST ?code=XXXX  → stores the JSON body under that code
 *
 * The code is both the name and the password of the slot: it is a long random
 * string the game generates once, and knowing it is what grants access. Guessing
 * one is 2^80-ish, and nothing here is worth guessing.
 *
 * The MERGE happens in the browser, not here — js/progress.js already owns that
 * logic and it is tested. This file is deliberately a dumb box: a second copy of
 * merge rules written in PHP is a second place for them to be wrong.
 *
 * HTTPS IS REQUIRED, not by this file but by the browser: the game is served
 * over https from GitHub Pages, and a browser refuses to call a plain http
 * endpoint from an https page.
 */

// ---------------------------------------------------------------- settings --
// Origins allowed to call this. Add your own if you host the game elsewhere.
// 'null' covers a game opened straight off the disk as file://.
$ALLOWED_ORIGINS = [
    'https://asafnac.github.io',
    'null',
];

$DATA_DIR  = __DIR__ . '/tower-sync-data';
$MAX_BYTES = 4 * 1024 * 1024;   // a save with a full log is well under 1 MB

// ------------------------------------------------------------------- setup --
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// A JSON-only reply, so the client never has to parse an HTML error page.
function reply(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// The browser preflights any POST carrying application/json.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// -------------------------------------------------------------------- auth --
$code = $_GET['code'] ?? '';
// Strict, and not only for tidiness: this value becomes part of a filename, and
// anything outside this alphabet has no business near a path.
if (!preg_match('/^[A-Za-z0-9_-]{16,64}$/', $code)) {
    reply(400, ['error' => 'bad code']);
}

// The file is named by a hash, so the code itself never appears on disk and a
// directory listing leaks nothing.
$file = $DATA_DIR . '/' . hash('sha256', $code) . '.json';

if (!is_dir($DATA_DIR)) {
    if (!@mkdir($DATA_DIR, 0770, true) && !is_dir($DATA_DIR)) {
        reply(500, ['error' => 'cannot create data dir']);
    }
    // Belt and braces on Apache; on nginx keep the folder outside the web root
    // or add a location block. Neither is required for correctness — the files
    // are named by hash — but there is no reason to serve them directly.
    @file_put_contents($DATA_DIR . '/.htaccess', "Require all denied\n");
    @file_put_contents($DATA_DIR . '/index.html', '');
}

// --------------------------------------------------------------------- GET --
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    if (!is_file($file)) {
        reply(200, ['save' => null, 'updatedAt' => null]);
    }
    $raw = @file_get_contents($file);
    $doc = $raw === false ? null : json_decode($raw, true);
    if (!is_array($doc)) {
        reply(200, ['save' => null, 'updatedAt' => null]);
    }
    reply(200, [
        'save'      => $doc['save'] ?? null,
        'updatedAt' => $doc['updatedAt'] ?? null,
    ]);
}

// -------------------------------------------------------------------- POST --
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) === 0) {
        reply(400, ['error' => 'empty body']);
    }
    if (strlen($raw) > $MAX_BYTES) {
        reply(413, ['error' => 'too large']);
    }

    $save = json_decode($raw, true);
    if (!is_array($save)) {
        reply(400, ['error' => 'body is not JSON']);
    }
    // A save without a log is either a bug or something else entirely; refusing
    // it means a broken client cannot wipe a year of history with one bad POST.
    // The client guarantees the field exists from its very first load — an empty
    // array is fine and is what a new device sends.
    if (!array_key_exists('log', $save) || !is_array($save['log'])) {
        reply(400, ['error' => 'not a game save']);
    }

    $doc = json_encode(
        ['save' => $save, 'updatedAt' => gmdate('c')],
        JSON_UNESCAPED_UNICODE
    );

    // Write to a temp file and rename: a rename is atomic, so a reader can never
    // catch a half-written save, and a crash mid-write leaves the old one intact.
    $tmp = $file . '.' . bin2hex(random_bytes(6)) . '.tmp';
    if (@file_put_contents($tmp, $doc, LOCK_EX) === false || !@rename($tmp, $file)) {
        @unlink($tmp);
        reply(500, ['error' => 'cannot write']);
    }

    reply(200, ['ok' => true, 'updatedAt' => json_decode($doc, true)['updatedAt']]);
}

reply(405, ['error' => 'method not allowed']);
