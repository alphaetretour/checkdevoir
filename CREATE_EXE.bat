@echo off
:: ============================================
:: Script pour créer un .exe auto-extractible avec 7-Zip
:: ============================================

@echo Ce script va créer un fichier .exe auto-extractible contenant :
@echo - Le projet Homework Check
@echo - Le script d'installation (INSTALL.bat)
@echo - Les instructions (INSTRUCTIONS.txt)
@echo.

:: Vérifier que 7-Zip est installé
where 7z >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: 7-Zip n'est pas installe sur ce systeme.
    echo Telechargez-le depuis https://www.7-zip.org/ et reinstallez ce script
    pause
    exit /b
)

:: Créer un dossier temporaire pour l'archive
if exist "temp_package" rmdir /s /q "temp_package"
mkdir "temp_package"

:: Copier tous les fichiers nécessaires
xcopy /E /I /Q . "temp_package\HomeworkCheck" >nul

:: Copier les fichiers d'installation à la racine
copy "temp_package\HomeworkCheck\INSTALL.bat" "temp_package\" >nul
copy "temp_package\HomeworkCheck\INSTRUCTIONS.txt" "temp_package\" >nul

:: Créer un fichier README à la racine
(
    echo ============================================
    echo Homework Check - Package d'installation
    echo ============================================
    echo.
    echo Pour installer l'application :
    echo 1. Double-cliquez sur INSTALL.bat
    echo 2. Suivez les instructions
    echo.
    echo Pour heberger sur Netlify :
    echo Voir INSTRUCTIONS.txt
    echo ============================================
) > "temp_package\README.txt"

:: Créer l'archive 7z avec SFX
@echo Creation de l'archive auto-extractible...
7z a -t7z "HomeworkCheck.7z" "temp_package\*" -mx=5 -mmt=on

:: Créer le module SFX
@echo Configuration du module SFX...
(
    echo ;!@Install@!UTF-8!
    echo Title="Homework Check - Installation"
    echo BeginPrompt="Voulez-vous installer Homework Check ?"
    echo RunProgram=""
    echo Directory="HomeworkCheck"
    echo ;!@InstallEnd@!
) > "temp_package\sfx_config.txt"

:: Combiner avec le module SFX de 7-Zip
copy /b "%ProgramFiles%\7-Zip\7zS2.sfx" + "sfx_config.txt" + "HomeworkCheck.7z" "HomeworkCheck.exe" >nul

:: Nettoyer les fichiers temporaires
if exist "temp_package" rmdir /s /q "temp_package"
if exist "HomeworkCheck.7z" del "HomeworkCheck.7z"
if exist "sfx_config.txt" del "sfx_config.txt"

@echo.
@echo ============================================
@echo SUCCÈS !
@echo ============================================
@echo.
@echo Le fichier HomeworkCheck.exe a ete cree.
@echo Partagez ce fichier avec vos amis.
@echo.
@echo Quand ils l'executent, il extraira automatiquement :
@echo - Le dossier HomeworkCheck avec tout le code
@echo - INSTALL.bat pour installer les dependances
@echo - INSTRUCTIONS.txt pour heberger sur Netlify
@echo.
pause
