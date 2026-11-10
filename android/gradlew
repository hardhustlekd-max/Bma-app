#!/bin/sh
APP_BASE_NAME=`basename "$0"`
APP_HOME=$(cd "`dirname "$0"`" && pwd -P)
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
