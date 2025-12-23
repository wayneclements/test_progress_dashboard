import React from 'react'

export default function App() {
  return (
    <div style={{padding:20}}>
      <h1>Main Page</h1>
      <div style={{display: 'flex', gap: '20px'}}>
        <div style={{flex: 1, border: '1px solid #ccc', padding: '20px'}}>
          <h2>Column 1</h2>
          <p>Left column content</p>
        </div>
        <div style={{flex: 1, border: '1px solid #ccc', padding: '20px'}}>
          <h2>Column 2</h2>
          <p>Right column content</p>
        </div>
      </div>
    </div>
  )
}
