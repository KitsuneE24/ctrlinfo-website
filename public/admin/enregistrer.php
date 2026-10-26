<?php
// Enregistre un fichier de donnees/ (?fichier=contenu|posts-vrais|posts-faux).
// L'accès est fermé par le .htaccess voisin.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function sortir(int $code, string $message): never
{
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    sortir(405, 'Méthode non autorisée.');
}

$nom = $_GET['fichier'] ?? 'contenu';
if (!in_array($nom, ['contenu', 'posts-vrais', 'posts-faux'], true)) {
    sortir(400, 'Fichier inconnu.');
}
$fichier = __DIR__ . "/../donnees/$nom.json";
if (!is_writable(dirname($fichier))) {
    sortir(500, 'Le dossier donnees/ n’est pas accessible en écriture.');
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
    sortir(400, 'JSON illisible : ' . json_last_error_msg());
}

// Un enregistrement ne doit jamais pouvoir vider le site.
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
    // Chaque fichier ne garde que son camp.
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
    sortir(500, 'Réencodage impossible.');
}

// La version précédente est gardée avant d'écrire.
if (is_file($fichier)) {
    copy($fichier, $fichier . '.bak');
}

// Écriture atomique : on remplace le fichier d'un seul coup, jamais en place.
$temporaire = tempnam(dirname($fichier), $nom);
if ($temporaire === false || file_put_contents($temporaire, $encode . "\n") === false) {
    sortir(500, 'Écriture impossible.');
}
chmod($temporaire, 0644);
if (!rename($temporaire, $fichier)) {
    unlink($temporaire);
    sortir(500, 'Remplacement impossible.');
}

echo json_encode([
    'enregistre' => true,
    'octets' => strlen($encode),
    'horodatage' => gmdate('c'),
], JSON_UNESCAPED_UNICODE);
