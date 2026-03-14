$env:JAVA_HOME = $null
java -version
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }
cd android
./gradlew assembleDebug
if ($LASTEXITCODE -ne 0) { exit 1 }
