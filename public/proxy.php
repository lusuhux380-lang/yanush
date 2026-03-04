<?php
/**
 * proxy.php — серверный прокси для запросов к ProxyAPI (proxyapi.ru).
 *
 * Запускается на Beget (Russian shared hosting), поэтому не блокируется ТСПУ.
 * Читает API-ключ из файла на сервере (за пределами webroot) или из env-переменной.
 *
 * Установка API-ключа (один раз, вручную на сервере):
 *   Вариант A — файл вне webroot:
 *     echo 'ВАШ_КЛЮЧ' > ~/yanush_api_key && chmod 600 ~/yanush_api_key
 *   Вариант B — переменная окружения в .htaccess (в корне public_html):
 *     SetEnv YANUSH_API_KEY ВАШ_КЛЮЧ
 */

define('REQUEST_TIMEOUT_SECONDS', 90);

// ─── Читаем API-ключ ─────────────────────────────────────────────────────────
// dirname(__DIR__) — родительская директория папки, в которой лежит скрипт.
// Если proxy.php находится в public_html/, то это ~/
$keyFile = dirname(__DIR__) . '/yanush_api_key';
$API_KEY = file_exists($keyFile)
    ? trim(file_get_contents($keyFile))
    : (getenv('YANUSH_API_KEY') ?: '');

if ($API_KEY === '') {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'API key not configured on server']);
    exit;
}

// ─── Healthcheck ─────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'route' => '/proxy.php', 'ts' => time()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ─── Валидация параметра url ──────────────────────────────────────────────────
$action = isset($_GET['url']) ? trim($_GET['url']) : '';

if (!preg_match('/^gemini[-\w]*(\.\d+)*:(generateContent|streamGenerateContent)$/', $action)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => "Bad url parameter. Expected like 'gemini-2.0-flash-lite:generateContent'.",
    ]);
    exit;
}

// ─── Форвардинг запроса к proxyapi.ru ────────────────────────────────────────
$targetUrl = 'https://api.proxyapi.ru/google/v1beta/models/' . rawurlencode($action);
$requestBody = file_get_contents('php://input');

$ctx = stream_context_create([
    'http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $API_KEY,
        ]),
        'content'       => $requestBody,
        'timeout'       => REQUEST_TIMEOUT_SECONDS,
        'ignore_errors' => true,
    ],
    'ssl' => [
        'verify_peer'       => true,
        'verify_peer_name'  => true,
    ],
]);

$response = file_get_contents($targetUrl, false, $ctx);

if ($response === false) {
    $err = error_get_last();
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Failed to reach proxyapi.ru', 'detail' => $err['message'] ?? '']);
    exit;
}

// Извлекаем HTTP-статус из $http_response_header
$statusCode = 500;
if (!empty($http_response_header)) {
    foreach ($http_response_header as $h) {
        if (preg_match('#^HTTP/\d+\.\d+\s+(\d+)#', $h, $m)) {
            $statusCode = (int) $m[1];
        }
    }
}

http_response_code($statusCode);
header('Content-Type: application/json; charset=utf-8');
echo $response;
