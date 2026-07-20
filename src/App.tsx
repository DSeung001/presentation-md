import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Fonts from './pages/Fonts'
import Home from './pages/Home'
import Viewer from './pages/Viewer'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="fonts" element={<Fonts />} />
        <Route path="p/:slug" element={<Viewer />} />
      </Route>
    </Routes>
  )
}
