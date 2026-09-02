@echo off
:: ============================================
:: Homework Check - Script d'installation automatique
:: Ce script installe Git et Node.js pour développer localement
:: ============================================

@echo Installation des prérequis pour Homework Check...
@echo.

:: Vérifier si on est admin (nécessaire pour l'installation)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Ce script doit etre execute en tant qu'administrateur.
    echo Veuillez faire clic droit sur install.bat et choisir "Exécuter en tant qu'administrateur"
    pause
    exit /b
)

:: Créer un dossier pour les installateurs
if not exist "installers" mkdir installers

:: Télécharger Git (version portable ou installateur)
@echo Téléchargement de Git...
echo.
if not exist "installers\Git-2.44.0-64-bit.exe" (
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe', 'installers\Git-2.44.0-64-bit.exe')"
)

:: Télécharger Node.js LTS
@echo Téléchargement de Node.js...
echo.
if not exist "installers\node-v20.12.2-x64.msi" (
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi', 'installers\node-v20.12.2-x64.msi')"
)

:: Installer Git
@echo Installation de Git...
echo.
start /wait installers\Git-2.44.0-64-bit.exe /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS

:: Installer Node.js
@echo Installation de Node.js...
echo.
start /wait installers\node-v20.12.2-x64.msi /qn /norestart

:: Vérifier les installations
@echo.
@echo Vérification des installations...
where git >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: Git n'a pas ete installe correctement
    pause
    exit /b
)

where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: Node.js n'a pas ete installe correctement
    pause
    exit /b
)

:: Installer les dépendances du projet
@echo.
@echo Installation des dependances du projet...
cd /d %~dp0
call npm install

@echo.
@echo ============================================
@echo Installation terminee avec succes!
@echo ============================================
@echo.
@echo Pour lancer l'application en developpement:
@echo   npm run dev
@echo.
@echo Pour construire l'application:
@echo   npm run build
@echo.
@echo Pour heberger sur Netlify, suivez les instructions dans INSTRUCTIONS.txt
@echo.
pause
