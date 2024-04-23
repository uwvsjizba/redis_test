module.exports = {
    extends: ["eslint-recommend"],
    env: {
        node: true,
        browser: true
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module"
    },
    rules: {
        "no-var": 2
    }
}