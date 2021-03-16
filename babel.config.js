module.exports = {
  "presets": [
    "next/babel",
    "@babel/preset-react"
  ],
  "env": {
    "test": {
      "presets": [
        "@babel/preset-env",
        "next/babel"
      ]
    },
  },
  "plugins": ["@babel/plugin-proposal-class-properties"]
}