import { fontStacksToStyle } from '../lib/fonts'
import { FONT_PRESETS } from '../lib/markdown'

const KO_HEADING = '발표 자료 제목'
const KO_BODY = '한글 본문과 숫자 123, 영문 presentation-md가 섞인 문장입니다.'
const EN_HEADING = 'Presentation Title'
const EN_BODY = 'English body with mixed 한글 text and numbers 456.'

export default function Fonts() {
  return (
    <section className="fonts-page">
      <h1>글꼴 미리보기</h1>
      <p className="lede">
        frontmatter에서 <code>fontKo</code>, <code>fontEn</code>으로 한글·영어
        글꼴을 각각 지정할 수 있습니다. <code>font</code>는 둘 다에 적용되는
        shorthand입니다.
      </p>

      <div className="font-preview-grid">
        {FONT_PRESETS.map((preset) => {
          const style = fontStacksToStyle({
            ko: preset.ko,
            en: preset.en,
          })

          return (
            <article key={preset.id} className="font-card">
              <header className="font-card-header">
                <h2>{preset.label}</h2>
                <code>fontKo: {preset.id}</code>
                <code>fontEn: {preset.id}</code>
              </header>

              <div className="font-card-samples">
                <div className="font-sample">
                  <span className="font-sample-label">한글</span>
                  <div className="prose font-sample-body" style={style}>
                    <h3>{KO_HEADING}</h3>
                    <p>{KO_BODY}</p>
                  </div>
                </div>

                <div className="font-sample">
                  <span className="font-sample-label">English</span>
                  <div className="prose font-sample-body" style={style}>
                    <h3>
                      <span className="text-en">{EN_HEADING}</span>
                    </h3>
                    <p>
                      <span className="text-en">{EN_BODY}</span>
                    </p>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
