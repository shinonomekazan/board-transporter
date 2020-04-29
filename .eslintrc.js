module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		"airbnb-base",
	],
	plugins: [
		"@typescript-eslint",
	],
	settings: {
		"import/resolver": {
			"node": {
				"extensions": [
					".ts",
				],
			},
		},
	},
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "error" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
		// tsのunused-varsを使う
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": "error",
		// tsのsemiを使う
		"semi": "off",
		"@typescript-eslint/semi": ["error"],
		// クォートはダブルクォート
		quotes: ["error", "double"],
		// インデントはタブ
		indent: ["error", "tab"],
		// 行辺りの文字数は80じゃなくて180
		"max-len": ["error", { code: 160 }],
		// インデントにタブは使っていい（途中のタブは駄目）
		"no-tabs": ["error", { allowIndentationTabs: true }],
		// for of解禁
		"no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
		// ループの中なら++使っていい
		"no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
		// class methodsにthisは使わなくてもいい
		"class-methods-use-this": "off",
		// 複数クラスを同一ファイルに書いていい
		"max-classes-per-file": "off",
		// 単一の名前付きexportを許可
		"import/prefer-default-export": "off",
		// continue使ってよし
		"no-continue": "off",
		// overloadで使うし同一名はTypeScriptでチェックするので重複許可
		"no-dupe-class-members": "off",
		"no-underscore-dangle": ["error", {"allowAfterThis": true}],
		"import/extensions": "off",
		"no-undef": "off",
		"no-await-in-loop": "off",
		"no-plusplus": "off"
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		parser: "@typescript-eslint/parser",
		sourceType: "module",
		project: "./tsconfig.json",
	},
};

