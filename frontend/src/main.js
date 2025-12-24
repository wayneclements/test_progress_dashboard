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
          React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '12px', overflowY: 'auto' } },
            React.createElement('h3', null, 'Documents'),
            docsLoading && React.createElement('p', null, 'Loading documents...'),
            !docsLoading && projectDocuments.length === 0 && React.createElement('p', { style: { color: '#999' } }, 'No documents found'),
            !docsLoading && projectDocuments.length > 0 && React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
              projectDocuments.map(doc =>
                React.createElement('li', {
                  key: doc.id,
                  onClick: () => setSelectedDocument(doc),
                  style: {
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: selectedDocument?.id === doc.id ? '#007bff' : '#fff',
                    color: selectedDocument?.id === doc.id ? 'white' : 'black',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #ddd',
                    fontWeight: selectedDocument?.id === doc.id ? 'bold' : 'normal'
                  }
                },
                  React.createElement('p', { style: { margin: '0', fontSize: '14px' } }, doc.document_id)
                )
              )
            )
          ),
          React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '12px', overflowY: 'auto' } },
            React.createElement('h3', null, 'Document Details'),
            selectedDocument
              ? React.createElement(React.Fragment, null,
                  React.createElement('p', null, React.createElement('strong', null, 'Document ID: '), selectedDocument.document_id),
                  React.createElement('p', null, React.createElement('strong', null, 'Project: '), selectedDocument.project_name),
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
