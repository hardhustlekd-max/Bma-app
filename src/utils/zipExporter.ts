import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/androidProjectFiles';

export async function generateAndDownloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add all files from our project file list
  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.code);
  }

  // Add robust self-bootstrapping gradlew shell script
  zip.file(
    'gradlew',
    `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
APP_HOME=$(cd "\`dirname "$0"\`" && pwd -P)
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

if [ -n "$JAVA_HOME" ] ; then
    JAVACMD="$JAVA_HOME/bin/java"
else
    JAVACMD="java"
fi

if [ ! -f "$CLASSPATH" ]; then
    echo "gradle-wrapper.jar not found, downloading Gradle 8.7 wrapper..."
    mkdir -p "$APP_HOME/gradle/wrapper"
    if command -v curl >/dev/null 2>&1; then
        curl -sLo "$CLASSPATH" https://raw.githubusercontent.com/gradle/gradle/v8.7.0/gradle/wrapper/gradle-wrapper.jar
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O "$CLASSPATH" https://raw.githubusercontent.com/gradle/gradle/v8.7.0/gradle/wrapper/gradle-wrapper.jar
    fi
fi

if [ -f "$CLASSPATH" ]; then
    exec "$JAVACMD" -jar "$CLASSPATH" "$@"
else
    exec gradle "$@"
fi
`,
    { unixPermissions: '755' }
  );

  // Add gradle.properties
  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
`
  );

  // Add gradle wrapper properties
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // Add root build.gradle.kts
  zip.file(
    'build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
  );

  // Add gradle/libs.versions.toml
  zip.file(
    'gradle/libs.versions.toml',
    `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.2.0"
swiperefreshlayout = "1.1.0"
activityKtx = "1.9.3"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-swiperefreshlayout = { group = "androidx.swiperefreshlayout", name = "swiperefreshlayout", version.ref = "swiperefreshlayout" }
androidx-activity-ktx = { group = "androidx.activity", name = "activity-ktx", version.ref = "activityKtx" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`
  );

  // Add vector drawables for no wifi and refresh
  zip.file(
    'app/src/main/res/drawable/ic_no_wifi.xml',
    `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#0284C7"
      android:pathData="M23.64,7c-0.45,-0.34 -4.93,-4 -11.64,-4 -1.5,0 -2.8,0.19 -3.97,0.47l2.84,2.84C11.5,6.1 11.87,6 12,6c5.52,0 9.27,2.88 9.58,3.13l2.06,-2.13zM1.41,1.59L0,3l2.45,2.45C1.52,5.92 1.05,6.33 0.36,7l11.63,14.49 0.01,0.01 0.01,-0.01 3.9,-4.86 4.67,4.67 1.41,-1.41L1.41,1.59zM12,18.82l-8.08,-10.07c0.88,-0.66 2.5,-1.6 4.63,-1.98l7.24,7.24L12,18.82z"/>
</vector>
`
  );

  // Add proguard rules
  zip.file(
    'app/proguard-rules.pro',
    `# Add project specific ProGuard rules here.
-keepclassmembers class * extends android.webkit.WebViewClient {
   public void *(android.webkit.WebView, java.lang.String);
}
-keepattributes JavascriptInterface
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bmarail-android-wrapper-kotlin.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
