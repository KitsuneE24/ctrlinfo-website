<?php
// Enregistre un fichier de donnees/ (?fichier=contenu|posts-vrais|posts-faux).
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const JOURNAL = __DIR__ . '/journal.log';

$utilisateur = (string) ($_SERVER['REMOTE_USER'] ?? $_SERVER['PHP_AUTH_USER'] ?? $_SERVER['REDIRECT_REMOTE_USER'] ?? '');
$nom = (string) ($_GET['fichier'] ?? 'contenu');

function tracer(string $resultat, string $detail = ''): void
{
    global $utilisateur, $nom;
    $ip = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __DIR__), 0, 12);
    $propre = fn(string $texte): string => str_replace(["\n", "\r", "\t"], ' ', $texte);
    $ligne = implode("\t", [
        gmdate('c'),
        'utilisateur=' . ($utilisateur !== '' ? $propre($utilisateur) : '-'),
        'fichier=' . preg_replace('/[^a-z-]/', '?', $nom),
        'resultat=' . $resultat,
        'ip=' . $ip,
        $propre($detail),
    ]) . "\n";
    @file_put_contents(JOURNAL, $ligne, FILE_APPEND | LOCK_EX);
}

function sortir(int $code, string $message, string $detail = ''): never
{
    tracer("refus-$code", $detail !== '' ? $detail : $message);
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($utilisateur === '') {
    sortir(401, 'Identification requise.', 'aucun utilisateur authentifié');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    sortir(405, 'Méthode non autorisée.');
}

$type = strtolower(trim(explode(';', (string) ($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
if ($type !== 'application/json') {
    sortir(415, 'Type de contenu refusé.', "content-type=$type");
}
$origine = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$hote = (string) ($_SERVER['HTTP_HOST'] ?? '');
if ($origine !== '' && parse_url($origine, PHP_URL_HOST) !== parse_url("//$hote", PHP_URL_HOST)) {
    sortir(403, 'Requête refusée.', "origine=$origine");
}
$site = (string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? 'same-origin');
if ($site !== 'same-origin') {
    sortir(403, 'Requête refusée.', "sec-fetch-site=$site");
}

if (!in_array($nom, ['contenu', 'posts-vrais', 'posts-faux'], true)) {
    sortir(400, 'Fichier inconnu.');
}
$fichier = __DIR__ . "/../donnees/$nom.json";
if (!is_writable(dirname($fichier))) {
    sortir(500, 'Enregistrement impossible. Contactez l’administrateur du serveur.', 'donnees/ non accessible en écriture');
}

$brut = file_get_contents('php://input');
if ($brut === false || $brut === '') {
    sortir(400, 'Corps de requête vide.');
}
if (strlen($brut) > 8 * 1024 * 1024) {
    sortir(413, 'Contenu trop volumineux.');
}

$contenu = json_decode($brut, true);
if (!is_array($contenu)) {
    sortir(400, 'Contenu illisible.', 'json : ' . json_last_error_msg());
}

if ($nom === 'contenu') {
    $requises = [
        'version', 'jeux', 'niveaux', 'remediations',
        'conversations', 'chapitres', 'stories', 'avatars', 'astuces',
    ];
    foreach ($requises as $cle) {
        if (!array_key_exists($cle, $contenu)) {
            sortir(422, "Clé manquante : $cle");
        }
        if (is_array($contenu[$cle]) && count($contenu[$cle]) === 0) {
            sortir(422, "Clé vide : $cle");
        }
    }
} else {
    if (!array_is_list($contenu) || count($contenu) === 0) {
        sortir(422, 'La liste de publications est vide.');
    }
    $attendu = $nom === 'posts-faux';
    foreach ($contenu as $i => $post) {
        if (($post['isFake'] ?? null) !== $attendu) {
            sortir(422, 'Publication ' . ($i + 1) . ' : isFake doit valoir ' . ($attendu ? 'true' : 'false') . '.');
        }
    }
}

$encode = json_encode(
    $contenu,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
if ($encode === false) {
    sortir(500, 'Enregistrement impossible.', 'réencodage json');
}

if (is_file($fichier)) {
    copy($fichier, $fichier . '.bak');
    copy($fichier, $fichier . '.bak.' . gmdate('YmdHis'));
    $anciennes = glob($fichier . '.bak.*') ?: [];
    rsort($anciennes);
    foreach (array_slice($anciennes, 10) as $ancienne) {
        unlink($ancienne);
    }
}

$temporaire = tempnam(dirname($fichier), $nom);
if ($temporaire === false || file_put_contents($temporaire, $encode . "\n") === false) {
    if ($temporaire !== false) {
        @unlink($temporaire);
    }
    sortir(500, 'Enregistrement impossible.', 'écriture du fichier temporaire');
}
chmod($temporaire, 0644);
if (!rename($temporaire, $fichier)) {
    unlink($temporaire);
    sortir(500, 'Enregistrement impossible.', 'remplacement du fichier');
}

tracer('succes', 'octets=' . strlen($encode));

echo json_encode([
    'enregistre' => true,
    'octets' => strlen($encode),
    'horodatage' => gmdate('c'),
], JSON_UNESCAPED_UNICODE);
