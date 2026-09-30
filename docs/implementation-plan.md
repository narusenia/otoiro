# otoiro 実装計画

要件: [requirements.md](./requirements.md)
進捗はチェックボックスで管理する。各フェーズ末で動作確認し、main へマージ（→ Workers Builds で自動デプロイ）。

## Phase 0: 土台

- [x] git init、GitHub リポジトリ作成（narusenia/otoiro、main push 済）
- [x] Vite + React + TypeScript 作成
- [x] shadcn 初期化（`--preset b1D0dxoG`）
- [x] ルーティング（ホーム / コース / 単元 / 自由練習 / 設定）
- [x] `cloudflare.config.ts`（Static Assets, SPA fallback）（`cf deploy --dry-run` まで確認済）→ `cf deploy` で初回疎通済（https://otoiro.notshinsin0000.workers.dev）
- [x] Workers Builds を GitHub 連携（`cf builds` で設定済。main push → 自動デプロイ成功を確認。PR プレビューは未確認）
- [x] Vitest 導入
- [x] i18n 基盤（文言キー、`ja` のみ）

## Phase 1: 音楽理論コア（Vitest 対象）

- [x] 音高モデル（MIDI 番号 ⇔ 音名、臨時記号、異名同音）
- [x] 音名表記変換（ドレミ / CDE / ハニホ）
- [x] 音程計算（単音程・複音程、上行/下行）
- [x] 和音生成（三和音 4 種、七の和音 5 種、転回形）
- [x] 調・スケール・度数（移動ド）、調号
- [x] カデンツ生成（I–IV–V–I）
- [x] メロディ自動生成（音数・跳躍幅・使用度数・主音終止）
- [x] 出題エンジン（重み付き抽選、苦手項目の重み更新）
- [x] 合格判定（10 問中 8 問）

## Phase 2: 音声・表示部品

- [x] Salamander サンプル（C2〜C7、21 音・1.3MB）→ `public/samples/salamander/`（CC BY 3.0 クレジット同梱。アプリ内クレジット表示は Phase 5）
- [x] 音声エンジン（実機での音出し確認は未）（Tone.js Sampler / サイン波切替、iOS アンロック）
- [x] 12 音カラーパレット（ライト/ダーク）
- [x] 鍵盤 UI（目視未確認）（スクロール、押下発音、ハイライト、音色表示）
- [x] 五線譜部品（目視未確認）（VexFlow: ト音/ヘ音、加線、臨時記号、調号）
- [x] MDX 埋込部品（`/dev` の確認ページは開発時のみ）: `<Play>`, `<Staff>`, `<Keyboard>`

## Phase 3: 学習フレーム

- [x] 保存層（IndexedDB、`src/store/` に隔離）: 進捗・苦手重み・設定・streak
- [x] MDX 読込パイプライン（frontmatter = 出題設定、前提単元）
- [x] コース一覧・単元ツリー（ロック/解放表示）
- [x] 単元画面: 解説 → ドリル → 結果（合格で次解放）
- [x] ドリル共通 UI（出題、回答、正誤フィードバック、正解との比較再生）
- [x] 自由練習モード
- [x] 設定画面（音色、音名表記、音量、テーマ）
- [x] streak 表示
- [ ] Phase 3 の画面・音の実機確認（Chrome 拡張未接続のため未実施。ユーザー確認待ち）
- [ ] UI 文言の i18n キー化（現状は `t()` 未経由の直書きが多い。機械的に置換可能）

## Phase 4: 各コース

各コースは「ドリル実装 → 単元 MDX 起草 → 校閲」の順。

- [x] 音程: ドリル（上行/下行/同時、複音程）
- [x] 音程: 単元 MDX 起草（有名曲連想含む）
- [ ] 音程: 校閲
- [x] 和音: ドリル（三和音 → 七の和音 → 転回形）
- [x] 和音: 単元 MDX 起草
- [ ] 和音: 校閲
- [x] 五線譜: ドリル（鍵盤回答）
- [x] 五線譜: 単元 MDX 起草
- [ ] 五線譜: 校閲
- [x] 度数/メロディ: ドリル（カデンツ提示、移動ド回答、正解譜面表示）
- [x] 度数/メロディ: 単元 MDX 起草
- [ ] 度数/メロディ: 校閲
- [x] コース間の前提単元設定（和音の最初は interval/thirds に依存）
- [ ] 五線譜の符幹・加線がダークモードで黒く見える不具合の修正（`src/components/Staff.tsx`）
- [ ] Phase 4 の全画面・音の実機確認（ユーザー確認待ち）

## Phase 5: 仕上げ

- [x] PWA（vite-plugin-pwa、サンプル含むプリキャッシュ、autoUpdate。アイコンは favicon.svg のみで PNG 未用意）
- [ ] スマホ実機確認（iOS Safari / Android Chrome）
- [ ] ダークモード・アクセシビリティ確認（コントラスト、キーボード操作、色だけに頼らない正誤表示）
- [ ] 本番デプロイ
