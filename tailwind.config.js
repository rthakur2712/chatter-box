// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter_400Regular"],
        interbold: ["Inter_700Bold"],
        intermedium: ["Inter_500Medium"],
        intersemibold: ["Inter_600SemiBold"],
        poppinssemibold: ["Poppins_600SemiBold"],
        poppinsregular: ["Poppins_400Regular"],
        poppinsbold: ["Poppins_700Bold"],
      },
    },
  },
  plugins: [],
};
