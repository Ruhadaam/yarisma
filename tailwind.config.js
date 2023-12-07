module.exports = {
  content: [
    "./views/**/*.ejs",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    container: {
      center: true
    },
    extend: {
      rotate: {
        '30': '30deg'
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
]

}