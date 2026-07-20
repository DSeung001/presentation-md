import { Link } from 'react-router-dom'
import { listDocs } from '../lib/markdown'

export default function Home() {
  const docs = listDocs()

  return (
    <section className="home">
      <h1>문서</h1>
      <p className="lede">
        Markdown으로 작성한 문서를 스크롤 또는 슬라이드 모드로 볼 수 있습니다.
      </p>
      <ul className="doc-list">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link to={`/p/${doc.slug}`}>{doc.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
