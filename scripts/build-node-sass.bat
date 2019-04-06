@echo off

set "ELECTRON=%4"
set "PLATFORM=%1"
set "ARCH=%2"
set "VER=%3"
set "ELECTRON_URL=https://atom.io/download/electron"
set "VENDOR_PATH=.\vendor"
set "BUILD_PATH=.\build\Release\binding.node"

cd .\node_modules\node-sass

echo Building %PLATFORM%-%ARCH% bindings
call ../.bin/node-gyp rebuild --target=%ELECTRON% --arch %ARCH% --dist-url=%ELECTRON_URL%

if exist %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER%\binding.node (
    echo Deleting old %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER%\binding.node
    del /S /Q %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER%\*
)

if not exist %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER% (
    echo Dir %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER% does not exist, creating.
    mkdir %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER%
)

if not exist %BUILD_PATH% (
    echo %BUILD_PATH% Does not exist
) else (
    echo Copying %BUILD_PATH% to %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER%
    copy %BUILD_PATH% %VENDOR_PATH%\%PLATFORM%-%ARCH%-%VER%
)
