/* =====================================================
   FLUTTER GRADLE ZERO TO HERO WEBSITE
   File: script.js
   Purpose: Navbar, scroll animation, file explorer, error search, quiz.
   ===================================================== */

/* =========================
   MODULE 1: SMALL HELPERS
========================= */
function getElement(id) {
  // Simple helper so we do not repeat document.getElementById many times.
  return document.getElementById(id);
}

function escapeHtml(text) {
  // Prevent code snippets from becoming real HTML when rendered inside the page.
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   MODULE 2: MOBILE NAVBAR
========================= */
const menuButton = getElement("menuButton");
const navLinks = getElement("navLinks");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    // Show/hide navbar links on small screens.
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      // Close menu after clicking a link on mobile.
      navLinks.classList.remove("open");
    });
  });
}

/* =========================
   MODULE 3: SCROLL PROGRESS BAR
========================= */
const scrollProgressBar = getElement("scrollProgressBar");

window.addEventListener("scroll", () => {
  if (!scrollProgressBar) return;

  // Total scrollable height.
  const totalScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Current scroll percentage.
  const scrollPercentage = totalScrollableHeight > 0
    ? (window.scrollY / totalScrollableHeight) * 100
    : 0;

  // Update progress bar width.
  scrollProgressBar.style.width = `${scrollPercentage}%`;
});

/* =========================
   MODULE 4: REVEAL ON SCROLL
========================= */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // When the element enters screen, add show class.
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.14,
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

/* =========================
   MODULE 5: ACTIVE NAV LINK
========================= */
const sections = document.querySelectorAll("header[id], section[id]");
const navItems = document.querySelectorAll(".navbar__links a");

window.addEventListener("scroll", () => {
  let currentSectionId = "home";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 160;

    if (window.scrollY >= sectionTop) {
      currentSectionId = section.id;
    }
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("href") === `#${currentSectionId}`);
  });
});

/* =========================
   MODULE 6: FILE EXPLORER DATA
   This data controls the file details section.
========================= */
const fileData = {
  settings: {
    title: "android/settings.gradle",
    description:
      "This is the entry point of the Android Gradle project. It decides plugin repositories, dependency repositories, plugin versions, and included modules.",
    edit: [
      "Plugin versions such as Android Gradle Plugin and Kotlin plugin.",
      "pluginManagement repositories like google(), mavenCentral(), and gradlePluginPortal().",
      "dependencyResolutionManagement repositories for normal Android libraries.",
    ],
    avoid: [
      "Do not remove includeBuild for Flutter Gradle tools.",
      "Do not add random repositories unless a trusted SDK needs it.",
      "Do not mix old buildscript style and new plugins style without understanding the project.",
    ],
    code: String.raw`pluginManagement {
    def flutterSdkPath = {
        def properties = new Properties()
        file("local.properties").withInputStream { properties.load(it) }
        def flutterSdkPath = properties.getProperty("flutter.sdk")
        assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
        return flutterSdkPath
    }()

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

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

plugins {
    id "dev.flutter.flutter-plugin-loader" version "1.0.0"
    id "com.android.application" version "8.7.3" apply false
    id "org.jetbrains.kotlin.android" version "2.1.0" apply false
}

include ":app"`,
  },

  rootBuild: {
    title: "android/build.gradle",
    description:
      "This is the root Android build file. In modern Flutter projects, it is usually small because plugin versions are handled in settings.gradle.",
    edit: [
      "Rare root-level Gradle behavior shared by subprojects.",
      "Custom clean task or build directory setup if your project still uses it.",
    ],
    avoid: [
      "Do not put app-specific android { } config here.",
      "Do not keep old classpath versions here if you already migrated to plugins block.",
      "Do not duplicate repositories if dependencyResolutionManagement already handles them.",
    ],
    code: String.raw`allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = "../build"

subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}`,
  },

  appBuild: {
    title: "android/app/build.gradle",
    description:
      "This is the most important app module file. It controls Android application id, SDK versions, build types, signing, Java/Kotlin compatibility, NDK settings, and Android-only dependencies.",
    edit: [
      "namespace and applicationId.",
      "minSdk, targetSdk, and compileSdk.",
      "debug/release buildTypes.",
      "signingConfigs for release builds.",
      "dependencies for Android native libraries.",
    ],
    avoid: [
      "Do not set random minSdk just to hide an error. Understand which plugin requires it.",
      "Do not change applicationId after release unless you understand Play Store impact.",
      "Do not enable minify/shrinkResources without testing release build properly.",
    ],
    code: String.raw`plugins {
    id "com.android.application"
    id "org.jetbrains.kotlin.android"
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace "com.example.myapp"
    compileSdk flutter.compileSdkVersion

    defaultConfig {
        applicationId "com.example.myapp"
        minSdk flutter.minSdkVersion
        targetSdk flutter.targetSdkVersion
        versionCode flutter.versionCode
        versionName flutter.versionName
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            shrinkResources false
        }
    }
}

flutter {
    source "../.."
}`,
  },

  wrapper: {
    title: "android/gradle/wrapper/gradle-wrapper.properties",
    description:
      "This file locks the Gradle version used by this project. Your project uses ./gradlew from this wrapper instead of depending on your global Gradle installation.",
    edit: [
      "distributionUrl when upgrading Gradle wrapper.",
      "Use official AGP compatibility table before changing the version.",
    ],
    avoid: [
      "Do not randomly put the latest Gradle version.",
      "Do not edit this just because a dependency failed. First check the actual error.",
    ],
    code: String.raw`distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
  },

  gradleProperties: {
    title: "android/gradle.properties",
    description:
      "This file stores Gradle and Android build flags. It is useful for memory settings, AndroidX, Jetifier, and sometimes experimental behavior.",
    edit: [
      "org.gradle.jvmargs for Gradle daemon memory.",
      "android.useAndroidX=true for AndroidX projects.",
      "android.enableJetifier=true only when old dependencies need migration.",
    ],
    avoid: [
      "Do not keep Jetifier enabled forever if all dependencies are modern.",
      "Do not add random experimental flags from old answers.",
    ],
    code: String.raw`org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=2G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true`,
  },

  localProperties: {
    title: "android/local.properties",
    description:
      "This file stores paths for your local machine. It is generated locally and should usually not be committed to Git.",
    edit: [
      "flutter.sdk path if Flutter cannot find the SDK.",
      "sdk.dir path if Android SDK path is missing.",
    ],
    avoid: [
      "Do not commit local.properties to Git because every developer has different paths.",
      "Do not hardcode another developer's Flutter SDK path.",
    ],
    code: String.raw`sdk.dir=C:\Users\YourName\AppData\Local\Android\Sdk
flutter.sdk=C:\src\flutter
flutter.buildMode=debug
flutter.versionName=1.0.0
flutter.versionCode=1`,
  },

  manifest: {
    title: "android/app/src/main/AndroidManifest.xml",
    description:
      "This file declares Android app permissions, application metadata, activities, services, receivers, and intent filters. Many Flutter plugins also merge their own manifest entries during build.",
    edit: [
      "Permissions like INTERNET, CAMERA, LOCATION, BLUETOOTH, and POST_NOTIFICATIONS.",
      "MainActivity properties such as exported and launchMode.",
      "Metadata required by Firebase, Google Maps, or other SDKs.",
    ],
    avoid: [
      "Do not remove android:exported on modern Android if activity has intent filters.",
      "Do not add permissions you do not need.",
      "Do not ignore manifest merger errors; they usually tell the exact conflict.",
    ],
    code: String.raw`<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="myapp"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },

  keyProperties: {
    title: "android/key.properties",
    description:
      "This file is commonly used to store release signing information. It should not be pushed to public GitHub repositories.",
    edit: [
      "storePassword, keyPassword, keyAlias, and storeFile for release signing.",
      "Only use this when creating signed release APK/AAB.",
    ],
    avoid: [
      "Never commit keystore passwords to public GitHub.",
      "Never lose your upload key if your Play Store setup depends on it.",
    ],
    code: String.raw`storePassword=your-store-password
keyPassword=your-key-password
keyAlias=upload
storeFile=../app/upload-keystore.jks`,
  },
};

/* =========================
   MODULE 7: FILE EXPLORER RENDERING
========================= */
const fileDetailsContainer = getElement("fileDetails");
const fileButtons = document.querySelectorAll(".file-button");

function renderFileDetails(fileKey) {
  if (!fileDetailsContainer || !fileData[fileKey]) return;

  const file = fileData[fileKey];

  fileDetailsContainer.innerHTML = `
    <div class="file-details">
      <div>
        <h3>${escapeHtml(file.title)}</h3>
        <p class="file-details__description">${escapeHtml(file.description)}</p>
      </div>

      <div class="file-details__grid">
        <div class="file-mini-card">
          <strong>What you can edit</strong>
          <ul>
            ${file.edit.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>

        <div class="file-mini-card">
          <strong>What to avoid</strong>
          <ul>
            ${file.avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="file-code-title">
        <strong>Sample code</strong>
        <button class="copy-button" type="button" data-copy-code>Copy</button>
      </div>

      <pre class="code-block"><code>${escapeHtml(file.code)}</code></pre>
    </div>
  `;

  attachCopyButton();
}

fileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    fileButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderFileDetails(button.dataset.file);
  });
});

function attachCopyButton() {
  const copyButton = document.querySelector("[data-copy-code]");

  if (!copyButton || !fileDetailsContainer) return;

  copyButton.addEventListener("click", async () => {
    const codeText = fileDetailsContainer.querySelector("code")?.innerText || "";

    try {
      await navigator.clipboard.writeText(codeText);
      copyButton.textContent = "Copied";
      setTimeout(() => (copyButton.textContent = "Copy"), 1200);
    } catch (error) {
      copyButton.textContent = "Copy failed";
      setTimeout(() => (copyButton.textContent = "Copy"), 1200);
    }
  });
}

renderFileDetails("settings");

/* =========================
   MODULE 8: ERROR PLAYBOOK DATA
========================= */
const errorData = [
  {
    title: "Deprecated imperative apply of Flutter Gradle plugins",
    keywords: "apply from imperative flutter gradle plugin deprecated plugins block",
    meaning:
      "Your project still uses old Gradle syntax such as apply from. Modern Flutter projects use the declarative plugins block.",
    fixes: [
      "Open android/settings.gradle and check pluginManagement and plugins block.",
      "Open android/app/build.gradle and use id \"dev.flutter.flutter-gradle-plugin\" inside plugins { }.",
      "Create a fresh Flutter app and compare the Android folder with your old project.",
    ],
  },
  {
    title: "Namespace not specified",
    keywords: "namespace not specified android gradle plugin 8 agp",
    meaning:
      "AGP 8+ expects every Android module to define namespace inside android { }.",
    fixes: [
      "Open android/app/build.gradle.",
      "Inside android { }, add namespace \"com.yourcompany.yourapp\".",
      "If the error comes from a package plugin, update that Flutter package first.",
    ],
  },
  {
    title: "Kotlin binary metadata version mismatch",
    keywords: "kotlin metadata binary version incompatible kgp kotlin gradle plugin",
    meaning:
      "Some library was compiled with a newer Kotlin version than your project is using.",
    fixes: [
      "Check Kotlin plugin version in settings.gradle or root build.gradle.",
      "Update Kotlin plugin carefully, but keep it compatible with AGP and Gradle.",
      "Run flutter clean after version changes.",
    ],
  },
  {
    title: "Unsupported class file major version",
    keywords: "unsupported class file major version java jdk gradle daemon",
    meaning:
      "Your Gradle or AGP version does not support the Java/JDK version being used.",
    fixes: [
      "Run flutter doctor -v and check Java path.",
      "Run cd android && ./gradlew -v to check Gradle runtime.",
      "Use the JDK expected by your AGP version, commonly JDK 17 for modern AGP.",
    ],
  },
  {
    title: "Manifest merger failed: minSdk too low",
    keywords: "manifest merger failed minsdk uses-sdk lower minimum sdk",
    meaning:
      "One plugin or Android library needs a higher minimum Android version than your app currently supports.",
    fixes: [
      "Read which library is asking for higher minSdk.",
      "Increase minSdk only if your app can stop supporting older Android versions.",
      "If possible, update or replace the package that forces high minSdk.",
    ],
  },
  {
    title: "Duplicate class found",
    keywords: "duplicate class found transitive dependency exclude implementation",
    meaning:
      "Two dependencies are bringing the same class into your build.",
    fixes: [
      "Run cd android && ./gradlew :app:dependencies.",
      "Find which two libraries bring the duplicate class.",
      "Prefer updating packages first. Use exclude only when you understand the dependency tree.",
    ],
  },
  {
    title: "Could not find com.android.tools.build:gradle",
    keywords: "could not find com.android.tools.build gradle repository google mavenCentral",
    meaning:
      "Gradle cannot download Android Gradle Plugin. Usually repositories, internet, proxy, or version typo is the cause.",
    fixes: [
      "Check pluginManagement repositories contain google(), mavenCentral(), and gradlePluginPortal().",
      "Check internet, proxy, VPN, or company firewall.",
      "Check the AGP version string is valid.",
    ],
  },
  {
    title: "AAPT2 resource linking failed",
    keywords: "aapt2 resource linking failed merge resources xml compileSdk android resource",
    meaning:
      "Android resources failed to compile. The cause can be bad XML, missing resource, wrong compileSdk, or dependency resource issue.",
    fixes: [
      "Scroll above the final error and find the exact XML or resource name.",
      "Check if a dependency requires higher compileSdk.",
      "Fix the actual resource issue before running clean.",
    ],
  },
  {
    title: "Gradle daemon or cache stuck",
    keywords: "gradle daemon stopped lock cache corrupted timeout clean",
    meaning:
      "After tool version changes, Gradle daemon or local cache can sometimes get stuck.",
    fixes: [
      "Run cd android && ./gradlew --stop.",
      "Run flutter clean and flutter pub get.",
      "Delete android/.gradle only if normal clean does not work.",
      "Avoid deleting the global Gradle cache every time because it slows future builds.",
    ],
  },
];

/* =========================
   MODULE 9: ERROR PLAYBOOK RENDERING
========================= */
const errorList = getElement("errorList");
const errorSearchInput = getElement("errorSearchInput");

function renderErrors(searchText = "") {
  if (!errorList) return;

  const normalizedSearch = searchText.toLowerCase().trim();

  const filteredErrors = errorData.filter((error) => {
    const searchableText = `${error.title} ${error.keywords} ${error.meaning}`.toLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  if (filteredErrors.length === 0) {
    errorList.innerHTML = `<div class="error-empty">No matching error found. Try another keyword like kotlin, java, minSdk, duplicate, or namespace.</div>`;
    return;
  }

  errorList.innerHTML = filteredErrors
    .map(
      (error) => `
        <article class="error-card">
          <button class="error-question" type="button">
            <span>${escapeHtml(error.title)}</span>
            <span aria-hidden="true">+</span>
          </button>

          <div class="error-answer">
            <p><strong>Meaning:</strong> ${escapeHtml(error.meaning)}</p>
            <ul>
              ${error.fixes.map((fix) => `<li>${escapeHtml(fix)}</li>`).join("")}
            </ul>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".error-question").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".error-card");
      const symbol = button.querySelector("span:last-child");

      if (!card || !symbol) return;

      card.classList.toggle("open");
      symbol.textContent = card.classList.contains("open") ? "−" : "+";
    });
  });
}

if (errorSearchInput) {
  errorSearchInput.addEventListener("input", () => {
    renderErrors(errorSearchInput.value);
  });
}

renderErrors();

/* =========================
   MODULE 10: QUIZ DATA
========================= */
const quizData = [
  {
    question: "What is the job of AGP in a Flutter Android project?",
    options: [
      "It writes Dart UI automatically",
      "It adds Android-specific build tasks to Gradle",
      "It replaces the Flutter SDK",
      "It stores app images",
    ],
    answer: 1,
    explanation: "Correct. Gradle is general. AGP teaches Gradle how to build Android apps.",
  },
  {
    question: "Which file locks the Gradle version used by your project?",
    options: [
      "pubspec.yaml",
      "AndroidManifest.xml",
      "gradle-wrapper.properties",
      "main.dart",
    ],
    answer: 2,
    explanation: "Correct. gradle-wrapper.properties contains the Gradle distribution URL.",
  },
  {
    question: "What is the modern way to apply Flutter Gradle plugins?",
    options: [
      "Use the plugins { } block",
      "Delete the Android folder every time",
      "Put Gradle code inside pubspec.yaml",
      "Change all versions randomly",
    ],
    answer: 0,
    explanation: "Correct. Modern Flutter projects use the declarative plugins block.",
  },
  {
    question: "What should you check first when a Gradle build fails?",
    options: [
      "The first real error line above the final summary",
      "Only the last line",
      "GitHub stars of the package",
      "Your app icon",
    ],
    answer: 0,
    explanation: "Correct. The final line is often only a summary. The real reason is usually above it.",
  },
  {
    question: "If a package requires minSdk 23 and your app uses minSdk 21, what can happen?",
    options: [
      "Manifest merger can fail",
      "Dart syntax will stop working",
      "CSS will not load",
      "The app name becomes empty",
    ],
    answer: 0,
    explanation: "Correct. Android manifest merge can fail when minSdk is lower than a dependency requires.",
  },
];

/* =========================
   MODULE 11: QUIZ LOGIC
========================= */
const quizQuestion = getElement("quizQuestion");
const quizOptions = getElement("quizOptions");
const quizFeedback = getElement("quizFeedback");
const nextQuestionButton = getElement("nextQuestionButton");
const resetQuizButton = getElement("resetQuizButton");

let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;

function renderQuiz() {
  if (!quizQuestion || !quizOptions || !quizFeedback) return;

  const currentQuestion = quizData[currentQuestionIndex];

  isAnswered = false;
  quizQuestion.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
  quizFeedback.textContent = `Score: ${score}/${quizData.length}`;

  quizOptions.innerHTML = currentQuestion.options
    .map(
      (option, index) => `
        <button class="quiz-option" type="button" data-option-index="${index}">
          ${escapeHtml(option)}
        </button>
      `
    )
    .join("");

  document.querySelectorAll(".quiz-option").forEach((button) => {
    button.addEventListener("click", () => checkQuizAnswer(button));
  });
}

function checkQuizAnswer(button) {
  if (isAnswered) return;

  isAnswered = true;

  const selectedIndex = Number(button.dataset.optionIndex);
  const currentQuestion = quizData[currentQuestionIndex];
  const optionButtons = document.querySelectorAll(".quiz-option");

  optionButtons.forEach((optionButton) => {
    optionButton.disabled = true;
  });

  if (selectedIndex === currentQuestion.answer) {
    button.classList.add("correct");
    score += 1;
  } else {
    button.classList.add("wrong");
    optionButtons[currentQuestion.answer].classList.add("correct");
  }

  quizFeedback.textContent = `${currentQuestion.explanation} Score: ${score}/${quizData.length}`;
}

if (nextQuestionButton) {
  nextQuestionButton.addEventListener("click", () => {
    currentQuestionIndex = (currentQuestionIndex + 1) % quizData.length;
    renderQuiz();
  });
}

if (resetQuizButton) {
  resetQuizButton.addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    renderQuiz();
  });
}

renderQuiz();
