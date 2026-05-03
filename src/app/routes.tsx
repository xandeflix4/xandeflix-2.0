import { BrowserRouter, Routes, Route } from 'react-router-dom'

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="flex items-center justify-center h-screen text-3xl font-bold">Xandeflix 2.0</div>} />
        {/* Auth routes */}
        {/* Catalog routes */}
        {/* Profile routes */}
      </Routes>
    </BrowserRouter>
  )
}
