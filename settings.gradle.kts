pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "bmarail-wrapper"

if (file("app").exists()) {
    include(":app")
} else if (file("android/app").exists()) {
    include(":app")
    project(":app").projectDir = file("android/app")
}
