function drawConnectors(container) {
  const boxes = container.querySelectorAll('[data-doc-id]')
  if (boxes.length < 2) return

  // Remove existing SVG if any
  const existingSvg = container.querySelector('svg.connectors')
  if (existingSvg) existingSvg.remove()

  // Create SVG overlay
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'connectors')
  svg.style.position = 'absolute'
  svg.style.top = '0'
  svg.style.left = '0'
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.pointerEvents = 'none'
  svg.style.zIndex = '0'

  // Draw lines from bottom of one box to top of next box
  for (let i = 0; i < boxes.length - 1; i++) {
    const box1 = boxes[i]
    const box2 = boxes[i + 1]

    // Get positions relative to container
    const rect1 = box1.getBoundingClientRect()
    const rect2 = box2.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // Calculate positions relative to container
    const x1 = rect1.left - containerRect.left + rect1.width / 2
    const y1 = rect1.bottom - containerRect.top
    const x2 = rect2.left - containerRect.left + rect2.width / 2
    const y2 = rect2.top - containerRect.top

    // Create line element
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', '#999')
    line.setAttribute('stroke-width', '2')

    svg.appendChild(line)
  }

  container.appendChild(svg)
  container.style.zIndex = '1'
}

function App() {
  const [projects, setProjects] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [selectedProject, setSelectedProject] = React.useState(null)
  const [showProjectPage, setShowProjectPage] = React.useState(false)
  const [projectDocuments, setProjectDocuments] = React.useState([])
  const [docsLoading, setDocsLoading] = React.useState(false)
  const [selectedDocument, setSelectedDocument] = React.useState(null)

  React.useEffect(() => {
    fetch('http://localhost:4000/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const loadProjectDocuments = (projectName) => {
    setDocsLoading(true)
    fetch(`http://localhost:4000/api/project-documents?projectName=${encodeURIComponent(projectName)}`)
      .then(res => res.json())
      .then(data => {
        setProjectDocuments(data)
        setDocsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setDocsLoading(false)
      })
  }

  return React.createElement(React.Fragment, null,
    !showProjectPage && React.createElement('div', { style: { padding: 20 } },
      React.createElement('h1', null, 'Projects Page'),
      React.createElement('div', { style: { display: 'flex', gap: '20px' } },
        React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', padding: '20px' } },
          React.createElement('h2', null, 'Projects'),
          loading && React.createElement('p', null, 'Loading...'),
          error && React.createElement('p', { style: { color: 'red' } }, `Error: ${error}`),
          !loading && !error && React.createElement(React.Fragment, null,
            projects.length === 0 
              ? React.createElement('p', null, 'No projects found')
              : React.createElement('ul', { style: { listStyle: 'none', padding: 0 } },
                  projects.map(project =>
                    React.createElement('li', { 
                      key: project.id,
                      onClick: () => setSelectedProject(project),
                      onDoubleClick: () => { setSelectedProject(project); setShowProjectPage(true); loadProjectDocuments(project.name) },
                      style: { 
                        marginBottom: '10px', 
                        padding: '10px', 
                        backgroundColor: selectedProject?.id === project.id ? '#007bff' : '#f5f5f5', 
                        color: selectedProject?.id === project.id ? 'white' : 'black',
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: selectedProject?.id === project.id ? 'bold' : 'normal'
                      } 
                    },
                      React.createElement('p', { style: { margin: '0', fontSize: '16px' } }, project.name)
                    )
                  )
                )
          )
        ),
        React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', padding: '20px' } },
          React.createElement('h2', null, 'Description'),
          selectedProject
            ? React.createElement(React.Fragment, null,
                React.createElement('h3', null, selectedProject.name),
                React.createElement('p', null, selectedProject.description || 'No description available')
              )
            : React.createElement('p', { style: { color: '#999' } }, 'Select a project to view details')
        )
      )
    ),
    showProjectPage && selectedProject && React.createElement('div', {
      style: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    },
      React.createElement('div', {
        style: {
          backgroundColor: '#FFFFE0',
          padding: '24px',
          borderRadius: '8px',
          width: '95vw',
          height: '90vh',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } },
          React.createElement('h2', { style: { margin: 0 } }, selectedProject.name),
          React.createElement('button', { onClick: () => setShowProjectPage(false), style: { padding: '6px 10px', cursor: 'pointer' } }, 'Close')
        ),
        React.createElement('div', { style: { display: 'flex', gap: '16px', height: 'calc(100% - 50px)' } },
          React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '12px', overflowY: 'auto', position: 'relative' }, ref: (el) => { if (el) setTimeout(() => drawConnectors(el), 100) } },
            React.createElement('h3', null, 'Documents'),
            docsLoading && React.createElement('p', null, 'Loading documents...'),
            !docsLoading && projectDocuments.length === 0 && React.createElement('p', { style: { color: '#999' } }, 'No documents found'),
            !docsLoading && projectDocuments.length > 0 && React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignContent: 'flex-start' } },
              projectDocuments.map((doc, idx) =>
                React.createElement('div', {
                  key: doc.id,
                  'data-doc-id': doc.id,
                  onClick: () => setSelectedDocument(doc),
                  style: {
                    width: 'calc(50% - 6px)',
                    padding: '12px',
                    backgroundColor: selectedDocument?.id === doc.id ? '#007bff' : '#fff',
                    color: selectedDocument?.id === doc.id ? 'white' : 'black',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '1px solid #ddd',
                    fontWeight: selectedDocument?.id === doc.id ? 'bold' : 'normal',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: '60px'
                  }
                },
                  React.createElement('p', { style: { margin: '0', fontSize: '14px', wordWrap: 'break-word' } }, doc.document_id)
                )
              )
            )
          ),
          React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '12px', overflowY: 'auto' } },
            React.createElement('h3', null, 'Document Details'),
            selectedDocument
              ? React.createElement(React.Fragment, null,
                  React.createElement('p', null, React.createElement('strong', null, 'Document ID: '), selectedDocument.document_id),
                  React.createElement('p', null, React.createElement('strong', null, 'Description: '), selectedDocument.document_description || 'No description')
                )
              : React.createElement('p', { style: { color: '#999' } }, 'Select a document to view details')
          )
        )
      )
    )
  )
}

const root = document.getElementById('root')
ReactDOM.createRoot(root).render(React.createElement(React.StrictMode, null, React.createElement(App)))
