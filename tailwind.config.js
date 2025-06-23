/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                text: '#4A4A4A'
            },
            fontFamily: {
                'sans': ['Lato-Regular'],
                'lato': ['Lato-Regular'],
                'lato-light': ['Lato-Light'],
                'lato-bold': ['Lato-Bold'],
                'lato-black': ['Lato-Black'],
                'lato-thin': ['Lato-Thin'],
                'lato-italic': ['Lato-Italic'],
                'lato-bold-italic': ['Lato-BoldItalic'],
                'lato-black-italic': ['Lato-BlackItalic'],
                'lato-light-italic': ['Lato-LightItalic'],
                'lato-thin-italic': ['Lato-ThinItalic'],
            }
        },
    },
    plugins: [],
}