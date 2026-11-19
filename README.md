# Vistaar

A Live TV app for Android TV, built for the remote: browse channels by language, check what's on now and next, keep favourites, and watch, all from the couch.

Vistaar is an **unofficial, independent client**. You sign in with your **own** Jio mobile number and one-time code, and it shows the channels that account is entitled to. It is not affiliated with, endorsed by or supported by Jio or its owners.

| Sign in | Home |
|---|---|
| ![Sign in](docs/screenshots/sign-in.png) | ![Home](docs/screenshots/home.png) |

| Live TV | Guide |
|---|---|
| ![Live TV](docs/screenshots/live-tv.png) | ![Guide](docs/screenshots/guide.png) |

| About |
|---|
| ![About](docs/screenshots/about.png) |

## Contents

- [Features](#features)
- [Download and install](#download-and-install)
- [Using the app](#using-the-app)
- [Build from source](#build-from-source)
- [Project layout](#project-layout)
- [How it works](#how-it-works)
- [Known limits](#known-limits)
- [Legal](#legal)

## Features

- **Sign in with a number and a code**, using an on-screen keypad (or the remote's number keys). You stay signed in until you sign out.
- **Only what you can watch.** On first launch the app checks every channel against your account and lists only the ones your plan includes. The result is remembered for 6 hours; use **Refresh** to re-check.
- **Home**: a hero for what you watched last, with the current programme, time left, description and progress; rows for recently watched, favourites and languages.
- **Live TV**: languages on the left, channels in the middle (with the programme on now), a preview panel on the right.
- **Free TV**: a separate tab with the free Indian channels from the community [iptv-org](https://github.com/iptv-org/iptv) playlist (about 850, grouped by category such as News, Movies and Music). They play in the same player, can be favourited, show on Home and turn up in search. No sign-in is needed for the streams themselves, but many are offline at any given time.
- **HD**: every HD channel in one place, from your Jio plan and from the free list, split into Live TV and Free TV.
- **Guide**: pick a channel and see today's programmes.
- **Search**: an on-screen keyboard that works with any remote, and recent searches.
- **Favourites**: hold OK on any channel to save it; sort and edit mode on its own screen.
- **Player**: channel up/down, quality (Auto or a fixed resolution), audio track, aspect (Fit, Zoom, Stretch), favourite, and a guide shortcut. The overlay hides itself after a few seconds.
- **Settings**: refresh channels, clear favourites or history, sign out, app and device details.
- **Refresh** button in the header on every screen (it spins while it re-checks your plan).
- Designed for 1920×1080 and scales to other TV resolutions.

## Download and install

For Samsung TVs, see the [standalone widget setup](#samsung-tv-standalone-widget) or [TizenBrew module](#samsung-tizen--tizenbrew-module).

The ready-to-install APK is in this repository:

**[`releases/Vistaar-0.2-debug.apk`](releases/Vistaar-0.2-debug.apk)**

- Version: 0.2 (build 2)
- Package: `com.vistaar.tv`
- Needs: Android TV / Google TV with Android 6.0 (API 23) or newer
- SHA-256: `AAED467808A44F81D52CF276CC2E271AD4125843783CE58D353FF93C18D54EC7`

It is signed with the standard Android **debug key**, which is fine for installing on your own TV but is not a Play Store build.

### Option 1: install from a USB drive or the TV's browser

1. Copy `Vistaar-0.2-debug.apk` to a USB drive and plug it into the TV, or put it somewhere the TV can download it.
2. Use a file manager app on the TV (or an app such as *Downloader*) to open the file.
3. When asked, allow that app to **install unknown apps**, then choose **Install**.
4. Open **Vistaar** from the TV's app list.

### Option 2: install with ADB (from a computer)

1. On the TV open **Settings → Device Preferences → About** and tap **Build** seven times to enable Developer options.
2. Open **Developer options** and turn on **USB debugging** (on some TVs it is called **ADB debugging** or **Network debugging**).
3. Find the TV's IP address under **Settings → Network & Internet**.
4. On your computer, with [Android platform-tools](https://developer.android.com/tools/releases/platform-tools) installed:

   ```bash
   adb connect <TV-IP>:5555
   adb install -r releases/Vistaar-0.2-debug.apk
   ```

5. The first time you connect, the TV asks you to allow the computer. Choose **Always allow** and **Allow**, then run the install command again if it said "unauthorized".
6. Open **Vistaar** from the TV's app list.

### Updating

Install a newer APK over the old one with `adb install -r ...`. Your sign-in and favourites are kept as long as the package name stays the same and the APKs share a signing key.

## Using the app

| Remote | What it does |
|---|---|
| **D-pad** | Move focus. The focused item turns white. |
| **OK** | Open or play. In the player, with the overlay hidden, it shows the controls. |
| **Hold OK** on a channel | Add or remove it from favourites. |
| **Up / Down** in the player | Next or previous channel (also the channel keys, if your remote has them). |
| **Back** | Hide the overlay, then leave the player. On Home it asks before exiting. |
| **Number keys** | Type digits on the sign-in screen. |

## Build from source

You need:

- **JDK 17**
- **Android SDK** with Platform 34 and Build-Tools 34 (installing Android Studio is the easiest way)
- Internet access on the first build (Gradle and dependencies are downloaded)

1. Create `local.properties` in the project root, pointing at your SDK (it is git-ignored):

   ```properties
   sdk.dir=C\:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
   ```

   On macOS or Linux: `sdk.dir=/Users/<you>/Library/Android/sdk` or `sdk.dir=/home/<you>/Android/Sdk`.

2. Build the debug APK:

   ```bash
   ./gradlew assembleDebug        # Windows: gradlew.bat assembleDebug
   ```

3. The APK is written to `app/build/outputs/apk/debug/app-debug.apk`.

You can also open the folder in Android Studio and run it on a TV emulator or a connected TV.

Dependencies: AndroidX Media3 1.3.1 (ExoPlayer with HLS and DASH), OkHttp 4.12, AndroidX RecyclerView. Kotlin 1.9, Android Gradle Plugin 8.5.

## Project layout

```
app/src/main/
├── AndroidManifest.xml
├── java/com/vistaar/tv/
│   ├── Api.kt              Network calls: sign-in, channel list, programme guide, stream URL, session storage
│   ├── Catalog.kt          Channel list, "which channels does this account get", favourites, recents, programme cache
│   ├── Theme.kt            Design system: colours, focus states, artwork, header, cards, dialogs
│   ├── Design.kt           Image loader and small shared helpers
│   ├── LoginActivity.kt    Mobile number and OTP screens
│   ├── HomeActivity.kt     Hero and rows
│   ├── LiveTvActivity.kt   Categories, channel list, preview
│   ├── FreeTvActivity.kt   Same layout for the free iptv-org channels
│   ├── HdTvActivity.kt     The HD tab (same screen, HD channels only)
│   ├── Free.kt             Downloads and parses the iptv-org playlist
│   ├── GuideActivity.kt    Programme guide
│   ├── SearchActivity.kt   On-screen keyboard search
│   ├── FavoritesActivity.kt
│   ├── SettingsActivity.kt Library, account, about
│   ├── PlayerActivity.kt   Playback, overlay, quality/audio panel, error card
│   └── PlaylistFix.kt      HLS playlist workaround (see below)
└── res/                    Icons, TV banner, wordmark, vector icons
releases/                   Built APK
docs/screenshots/           README images
```

## How it works

- **Sign in.** The app sends your number to Jio's sign-in service, which texts you a code; the code is verified and the session tokens it returns are stored on the TV, in the app's private storage.
- **Channel list and "your plan".** The app downloads the full channel list, then asks for each channel's stream the same way a playback request would. Channels that return a stream are the ones your account can watch; the rest (for example premium channels outside your plan) are hidden. This takes a minute or two on first launch.
- **Free TV.** The India playlist (`https://iptv-org.github.io/iptv/countries/in.m3u`) is downloaded, cached for 6 hours and parsed into channels. Their streams are played directly with their own user agent and referrer where the playlist gives one; your Jio sign-in tokens are never sent to them. Free channels have no programme guide.
- **Programme data.** Today's schedule per channel comes from Jio's guide service and is cached for two minutes.
- **Playback.** Streams are played with ExoPlayer. While you watch, the next and previous channel are looked up in the background, so changing channel starts in well under a second.
- **Playback (details).** Streams are played with ExoPlayer. Most channels are HLS; DASH channels use the TV's Widevine DRM. Two details matter: the stream host hands out a cookie that must be replayed on later requests, and the master playlists advertise I-frame (trick-play) playlists that the server refuses, which would stop playback, so `PlaylistFix.kt` removes those lines before parsing.
- **The design.** The interface follows the "Vistaar" design board (a dark, white-focus system with a blue accent), scaled from a 1920×1080 canvas.

## Known limits

- **Plan-gated channels.** About 195 of roughly 1,050 channels were refused for the account this was built and tested with, and are therefore hidden. A different account will see a different list.
- **Free channels are not vetted.** The iptv-org list is community-maintained; links come and go, some are geo-blocked, and DRM-protected or YouTube-only entries are skipped or fail to play. Cleartext (`http://`) streams are allowed for this reason.
- **Sessions.** When Jio answers 419 (access token expired) the app swaps the refresh token for a new one and retries. If that is rejected too, sign in again. Channels the server answers with "No eligible plans" are hidden; that depends on your Jio plan, not on the app.
- **Stream tokens expire.** The player reconnects up to twice on an error, then shows a retry card.
- **Artwork is generated.** The service provides no programme stills, so cards use gradient artwork chosen per channel.
- **Language names** (Hindi, English, Tamil and so on) are mapped from Jio's numeric language ids using public knowledge, not from official data. An unknown id shows as "Other".
- **Untested areas.** Search with real input, the favourites grid in edit mode, DRM channels on every TV model, and most error states have had limited testing. It was tested on one Android 11 TV.
- **Debug signing and no automated tests.**
- **Not on the Play Store**, and not intended for it.

## Legal

- Vistaar is a personal project for use with **your own subscription**. Use it only with an account you are entitled to use.
- It does **not** bypass payment, plan checks or DRM: channels outside your plan stay hidden, and protected streams are played through the TV's own Widevine.
- The Free TV channels come from the third-party iptv-org project and belong to their broadcasters; Vistaar does not host or control them.
- Jio, JioTV and related names and logos belong to their owners. Channel names, logos and programme titles shown in the screenshots belong to their broadcasters.
- Provided as is, with no warranty.

## Credits

- Interface, logo (the "Blade V" mark), app icon and TV banner: the Vistaar brand board.
- Studio mark on the About screen: fortyseven, <https://fortyseven.dev>.

## License

No license has been chosen yet. Until one is added, all rights are reserved by the author; add a `LICENSE` file before inviting contributions.


---

## Samsung TV standalone widget

The standalone widget targets Samsung TVs running **Tizen 5.5 or later**. It uses Samsung AVPlay for direct channel streams and shares the TizenBrew interface for M3U playlists, the free India catalogue, XMLTV guides, search, favourites and recent channels. Android Jio OTP, subscriber channels and Jio DRM playback are outside this build.

[Download Vistaar-unsigned.wgt](releases/Vistaar-unsigned.wgt). The widget needs a Samsung certificate profile for your TV before installation. The TizenBrew module below is an alternative if you already have TizenBrew installed.

### Sign and install with Samsung Smart Development Bridge

1. Install the Samsung TV SDK and Samsung Certificate Extension. Connect the computer and TV to the same network. In the TV's Apps screen, enable Developer Mode, enter the computer's IP address and restart the TV.
2. Connect from the computer with `sdb connect TV_IP:26101`. Use `sdb devices` to find the connected serial. In Certificate Manager, create a **Samsung TV** profile with the TV's DUID on its distributor certificate. In Device Manager, choose **Permit to install applications** if available.
3. From the repository root, run `python3 scripts/package-tizen.py` (Windows: `py -3 scripts/package-tizen.py`). This stages the app in `build/tizen/widget`. If you downloaded the WGT alone, extract it as a ZIP into that same empty folder, with `config.xml` at its root.
4. From the repository root or the directory containing `build`, sign, install and launch with the commands below. Substitute your certificate profile, the serial from step 2 and the signed WGT filename printed by the packager. If the packager reports a different output directory, use that directory in the install command.

```sh
tizen package -t wgt -s "PROFILE_NAME" -- build/tizen/widget
tizen install -s TV_SERIAL -n SIGNED_FILENAME.wgt -- build/tizen/widget
tizen run -s TV_SERIAL -p VistaarTV1.Vistaar
```

5. Open **Load free India channels**, or go to **Settings** to enter your own playlist and optional guide URL. Use the arrows and OK to choose a channel. Back closes the guide or player before returning to Home. Live availability, codecs and transport support vary by feed and TV.

The package and player lifecycle have local tests. Signing, AVPlay decoding, and remote behavior on physical hardware still need an on-device check.

[Samsung connection guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html) · [Certificates](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html) · [TV command line](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html)

## Samsung Tizen / TizenBrew module

This repository also contains an **independent web-app module** for TizenBrew. The original Android application remains in the Android Gradle project; the TizenBrew entry point is `app/index.html`, selected by the root `package.json`.

### Add to TizenBrew

In TizenBrew, open **Module Manager → Add GitHub Module** and enter the repository and branch. Module Manager adds the source prefix itself.

```text
lalit-op/vistaar@samsung-tizen
```

If the module is cached, remove it, restart TizenBrew, and add it again. Use a commit ID to pin a specific build.

![Home, Live TV, Guide and playlist setup in the Tizen 5.5 simulator](docs/screenshots/tizen-preview.webp)

The preview uses sample programme data. Add an XMLTV feed with matching channel IDs to see programme titles, progress and schedules. Live TV groups channels by playlist language when available, with the playlist category as a fallback.

### TizenBrew web module scope

The module is a browser-based TV interface with M3U/M3U8 playlist loading, an optional XMLTV guide, favourites, recent channels, search, basic HD categorisation, and HTML5 video playback. For HLS channels it loads bundled hls.js 1.6.13 on browsers with compatible Media Source Extensions and retries in the built-in video player if needed. Channel availability and codec support vary. It uses standard web APIs rather than Android classes.

**Important differences from the Android app:** this TizenBrew module does not implement the Android Jio OTP/session/channel-entitlement APIs, Jio stream resolution, ExoPlayer, Widevine DRM integration, or the Android HLS playlist workaround. Do not enter Jio credentials into this web module. It is not yet a feature-complete Android port.

TizenBrew app modules are served as web pages; they are not native Tizen packages. Module pages do not expose Samsung's `tizen` or `webapis` APIs, so playback is limited to what the TV's browser-based HTML5 media stack can play. Actual playback, remote behavior, and launch must be verified on the target TV.

### Development checks

Run `npm test` with Node.js 18 or newer to check the module manifest, JavaScript syntax, M3U parsing, and required TV navigation hooks. These checks do not emulate TizenBrew or certify a TV model.
