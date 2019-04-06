set "PLATFORM=win32"

set "NODE_API_VERSION=69"
set "ELECTRON_VERSION=4.0.8"

call ./scripts/build-keytar.bat %PLATFORM% ia32 %NODE_API_VERSION% %ELECTRON_VERSION%

set "NODE_API_VERSION=68"
set "ELECTRON_VERSION=5.0.0-beta.8"

call ./scripts/build-keytar.bat %PLATFORM% ia32 %NODE_API_VERSION% %ELECTRON_VERSION%
