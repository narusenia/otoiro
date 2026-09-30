import { MdxKeyboard, MdxStaff, Play } from '@/components/mdx'

/** 開発時のみ（/dev）。部品の目視確認用。本番ビルドには含まれない */
export default function Sandbox() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">部品確認</h1>
      <div className="flex gap-2">
        <Play notes="C4 E4">旋律的 C–E</Play>
        <Play notes="C4 E4 G4" mode="chord">和音 C</Play>
      </div>
      <MdxStaff notes="C4 E4 G4 C5" colored />
      <MdxStaff notes="F#4 B4 F4 A4" fifths={1} />
      <MdxStaff notes="C4 Eb4 Bb3 C5" clef="bass" fifths={-3} />
      <MdxStaff notes="A5 C6 F3 G2" />
      <MdxKeyboard from={60} to={83} highlight="C4 E4 G4" />
    </div>
  )
}
