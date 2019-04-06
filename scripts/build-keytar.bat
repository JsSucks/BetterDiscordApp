@echo off

set "PLATFORM=%1"
set "ARCH=%2"
set "NODE_API_VERSION=%3"
set "ELECTRON_VERSION=%4"
set "KEYTAR_VERSION=4.4.1"
set "ELECTRON_URL=https://atom.io/download/electron"

set "DIRECTORY=.\release-tmp\keytar.node\keytar-%KEYTAR_VERSION%"
set "FILENAME=%PLATFORM%-%ARCH%-%NODE_API_VERSION%.node"

cd .\node_modules\keytar

move .\build\Release .\release-tmp

if exist %DIRECTORY%\%FILENAME% (
    echo A binding already exists at %DIRECTORY%\%FILENAME% - deleting it
    del %DIRECTORY%\%FILENAME%
)

echo Building keytar for %PLATFORM%-%ARCH% with Node.js API version %NODE_API_VERSION% for Electron %ELECTRON_VERSION%
call ..\.bin\node-gyp rebuild --target=%ELECTRON_VERSION% --arch %ARCH% --dist-url=%ELECTRON_URL%

echo Moving keytar.node to %DIRECTORY%
mkdir %DIRECTORY%
move .\build\Release\keytar.node %DIRECTORY%\%FILENAME%
del /S /Q .\build\Release\*

move .\release-tmp\keytar.node .\build\Release
