# board-transporter

## どんなもの？

KANBANボードAからKANBANボードBにチケットを移動させるツールです。

ドライバーで拡張可能にしようと思いますが、直近の個人的な需要のため、とりあえずGitHub Projectのサポートをします。

## どういう時に使うの？

GitHub Projectをスプリント的に運用しようとすると、KANBANボードを切り替える時にチケットを繰り越す方法がなく、不便なので、そんな時に使います。

## 制限事項

- Columnの識別に名前を利用しているため、列の場所が同じでも、名前が違えば失敗します
	- 移動元のCloseされていないチケットが登録されている列と同じ名前の列がすべてある必要があります
	- 逆にいえば、移動先に移動元にはない列があっても問題なく動作します
- 移動元、移動先のProjectは事前に作成しておく必要があります

## 使い方

1. `npm i -g board-transporter` 等で、本モジュールをインストールしておきます
2. `.env.sample` を参考に `.env` を用意し、不要な入力の省略を行っておきます
	- このステップを省略しても対話型インターフェースで入力できますが、以下3項目くらいは入力しておくことをお勧めします
	- GITHUB_TOKEN: GitHubのアクセストークンです
3. `board-transporter copy` を実行し、移動元と移動先のURLを入力
	- `board-transporter copy URL1 URL2` 等
	- `board-transporter copy --token=TOKEN URL1 URL2` 等でも可

以上で登録されていないチケットが自動的に移動されます。

## LICENSE

MITです。

詳しくは[LICENSE](./LICENSE)をご参照ください。
