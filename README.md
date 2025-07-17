![MyMosque Logo](https://github.com/ali-vayani/MyMosque/blob/v3/assets/images/icon.png)

# MyMosque (iOS App)

My Mosque is a platform that helps connect masjid to their communities by providing an avenue to send quick announcements, post updates, and post prayer times!

> This is a fully open source project run by Ali Vayani with the goal of providing students with hands on, impactful, development experience while helping their community.


## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [VSCode Extensions](#vscode-extensions)
   - [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Contributing](#contributing)
6. [Related Repositories](#related-repositories)
7. [License](#license)

## Features
- **🕌 Masjid Network**: Connect with and follow your favorite masjids to stay updated with their latest activities and announcements
- 📢 **Real-time Announcements**: Receive instant notifications about important mosque announcements, community updates, and urgent messages
- 📅 **Event Management**: Stay informed about upcoming events, programs, lectures, and community gatherings at your connected masjids
- 🕐 **Prayer Times**: Access accurate, location-based prayer times for your local masjids with automatic updates
- 🔔 **Push Notifications**: Get real-time alerts for announcements, event reminders, and prayer time notifications to never miss important updates
- 📱 **User-friendly Interface**: Clean, intuitive design that makes it easy to navigate between different masjids and their content
- 🌐 **Community Connection**: Bridge the gap between masjid administration and community members through seamless digital communication
- ⚡ **Quick Updates**: Masjid administrators can instantly share time-sensitive information with their congregation

## Tech Stack
- **Framework**: [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Database**: [Supabase](https://supabase.com/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Icons**: [Expo Icons](https://icons.expo.fyi/Index) (Majority From Feather)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- ExpoGo on your mobile device. [iOS Download](https://apps.apple.com/us/app/expo-go/id982107779) and [Android Download](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_US)
- An iOS or Android emulator (OPTINAL). Follow the guide [here](https://docs.expo.dev/workflow/android-studio-emulator/) to set up an Android emulator or [here](https://docs.expo.dev/workflow/ios-simulator/) for an iOS simulator.

### VSCode Extensions

We recommend using the following VSCode extensions to improve your development experience:

- **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)**: For identifying and fixing linting issues.
- **[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)**: For automatic code formatting.
- **[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)**: For Tailwind CSS class autocomplete and IntelliSense.

### Installation

1. **Fork the Repository**

   Go to the [MyMosque repository](https://github.com/ali-vayani/MyMosque.git), click main on the left hand sice and switch the branch to "v3" and click the [Fork](https://github.com/ali-vayani/MyMosque.git) button in the top-right corner of the page.

   After forking, clone the repository to your local machine:

   ```sh
   git clone https://github.com/<your-username>/MyMosque.git
   cd MyMosque
   ```
2. **Install Dependencies**

   ```sh
    npm install
   ```
3. **Run the Project & Launch Emulator**
   ```sh
   npm start
   ```

   To open the app on an emulator, press either of the following keys in the terminal:

   - `i` to open on iOS simulator
   - `a` to open on Android emulator
  
   
4. **Download to physical device (OPTIONAL)**

   If you want to test the app on a physical device, connect your device to your computer
   with a USB cable and run the following command:

   - **For iOS:**

   ```sh
   npx expo run:ios --device
   ```

   - **For Android:**

   ```sh
   npx expo run:android --device
   ```

   > **Note**: Make sure to enable USB debugging on your Android device. You can find the instructions [here](https://developer.android.com/studio/debug/dev-options).

   This will install the development build onto your device.
