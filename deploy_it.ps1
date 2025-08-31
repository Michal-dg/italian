# Skrypt do automatycznego wgrania aplikacji do nauki wloskiego na GitHub

# 1. Ustaw na stałe link do Twojego repozytorium dla wersji wloskiej
# WAŻNE: Pamiętaj, aby utworzyć nowe, puste repozytorium na GitHub dla tej wersji!
$repoUrl = "https://github.com/Michal-dg/italian.git"

# 2. Sprawdź, czy git jest zainicjowany. Jeśli nie, zainicjuj go.
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Zainicjowano nowe repozytorium Git."
}

# 3. Sprawdź, czy zdalne repozytorium 'origin' już istnieje. Jeśli tak, usuń je.
$remoteExists = git remote | Where-Object { $_ -eq 'origin' }
if ($remoteExists) {
    Write-Host "Znaleziono istniejące repozytorium 'origin'. Usuwam je, aby uniknąć błędów..." -ForegroundColor Yellow
    git remote remove origin
}

# 4. Dodaj poprawne zdalne repozytorium
Write-Host "Dodaję poprawne zdalne repozytorium 'origin'."
git remote add origin $repoUrl

# 5. Wykonaj pozostałe komendy Git
git add .

# Poprawka błędu: Użycie wiadomości bez polskich znaków
$commitMessage = "Pierwsza wersja aplikacji do wloskiego"
git commit -m $commitMessage

git branch -M main
git push -u origin main

Write-Host "Gotowe! Pliki wersji wloskiej zostaly wgrane na GitHub." -ForegroundColor Green
