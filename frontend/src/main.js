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

function RichTextModal({ richTextModal, projectTagsLoading, closeRichTextModal, deleteRichTextValue, saveRichTextValue, setRichTextModal }) {
  const editorRef = React.useRef(null)
  const quillRef = React.useRef(null)

  React.useEffect(() => {
    if (richTextModal.open && editorRef.current && !quillRef.current) {
      // Initialize Quill editor
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link'],
            ['clean']
          ]
        }
      })
      
      // Set initial content
      quillRef.current.root.innerHTML = richTextModal.value || ''
      
      // Listen for text changes
      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML
        setRichTextModal(prev => ({ ...prev, value: html }))
      })
    }
    
    // Update content when modal value changes externally
    if (quillRef.current && richTextModal.open) {
      const currentHtml = quillRef.current.root.innerHTML
      if (currentHtml !== richTextModal.value) {
        quillRef.current.root.innerHTML = richTextModal.value || ''
      }
    }
    
    // Cleanup when modal closes
    if (!richTextModal.open && quillRef.current) {
      quillRef.current = null
    }
  }, [richTextModal.open, richTextModal.value])

  return React.createElement('div', {
    style: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
    }
  },
    React.createElement('div', {
      style: {
        backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '700px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '12px'
      }
    },
      React.createElement('h3', { style: { margin: 0 } }, `Edit Rich Text Tag: ${richTextModal.tagName}`),
      projectTagsLoading && React.createElement('p', { style: { color: '#666', margin: 0 } }, 'Refreshing tags...'),
      React.createElement('label', { style: { fontWeight: 'bold', fontSize: '14px' } }, 'Value'),
      React.createElement('div', {
        ref: editorRef,
        style: { height: '300px', backgroundColor: '#fff' }
      }),
      richTextModal.error && React.createElement('p', { style: { color: 'red', margin: 0 } }, richTextModal.error),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' } },
        React.createElement('button', { onClick: closeRichTextModal, style: { padding: '8px 12px', cursor: 'pointer' }, disabled: richTextModal.saving }, 'Cancel'),
        React.createElement('button', { onClick: deleteRichTextValue, style: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7' }, disabled: richTextModal.saving }, richTextModal.tagId ? 'Delete' : 'Discard'),
        React.createElement('button', { onClick: saveRichTextValue, style: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#0d6efd', color: '#fff', border: '1px solid #0b5ed7' }, disabled: richTextModal.saving }, richTextModal.tagId ? 'Save' : 'Create')
      )
    )
  )
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
  const [documentTags, setDocumentTags] = React.useState([])
  const [tagsLoading, setTagsLoading] = React.useState(false)
  const [projectTags, setProjectTags] = React.useState([])
  const [projectTagsLoading, setProjectTagsLoading] = React.useState(false)
  const [tagModal, setTagModal] = React.useState({ open: false, tagName: '', tagId: null, value: '', saving: false, error: null })
  const [richTextModal, setRichTextModal] = React.useState({ open: false, tagName: '', tagId: null, value: '', saving: false, error: null })
  const [dateModal, setDateModal] = React.useState({ open: false, tagName: '', tagId: null, value: '', saving: false, error: null })

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
    fetchProjectTags()
  }, [])

  const fetchProjectTags = () => {
    setProjectTagsLoading(true)
    fetch('http://localhost:4000/api/project-tags')
      .then(res => res.json())
      .then(data => {
        setProjectTags(data)
        setProjectTagsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setProjectTagsLoading(false)
      })
  }

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

  const loadDocumentTags = (documentName) => {
    setTagsLoading(true)
    setDocumentTags([])
    fetch(`http://localhost:4000/api/document-tags?documentName=${encodeURIComponent(documentName)}`)
      .then(res => res.json())
      .then(data => {
        setDocumentTags(data)
        setTagsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setTagsLoading(false)
      })
  }

  const openTagModal = (tag) => {
    const existing = projectTags.find(pt => pt.tag_name === tag.tag_name)
    const modalData = {
      open: true,
      tagName: tag.tag_name,
      tagId: existing ? existing.id : null,
      value: existing ? existing.tag_value || '' : '',
      saving: false,
      error: null
    }
    
    if (tag.type === 'rich_text') {
      setRichTextModal(modalData)
    } else if (tag.type === 'date') {
      setDateModal(modalData)
    } else {
      setTagModal(modalData)
    }
  }

  const closeTagModal = () => setTagModal({ open: false, tagName: '', tagId: null, value: '', saving: false, error: null })

  const closeRichTextModal = () => setRichTextModal({ open: false, tagName: '', tagId: null, value: '', saving: false, error: null })

  const closeDateModal = () => setDateModal({ open: false, tagName: '', tagId: null, value: '', saving: false, error: null })

  const saveTagValue = async () => {
    setTagModal(prev => ({ ...prev, saving: true, error: null }))
    try {
      if (tagModal.tagId) {
        await fetch(`http://localhost:4000/api/project-tags/${tagModal.tagId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_value: tagModal.value })
        })
      } else {
        await fetch('http://localhost:4000/api/project-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_name: tagModal.tagName, tag_value: tagModal.value })
        })
      }
      fetchProjectTags()
      closeTagModal()
    } catch (err) {
      setTagModal(prev => ({ ...prev, saving: false, error: 'Failed to save tag' }))
    }
  }

  const deleteTagValue = async () => {
    if (!tagModal.tagId) {
      return closeTagModal()
    }
    setTagModal(prev => ({ ...prev, saving: true, error: null }))
    try {
      await fetch(`http://localhost:4000/api/project-tags/${tagModal.tagId}`, {
        method: 'DELETE'
      })
      fetchProjectTags()
      closeTagModal()
    } catch (err) {
      setTagModal(prev => ({ ...prev, saving: false, error: 'Failed to delete tag' }))
    }
  }

  const saveRichTextValue = async () => {
    setRichTextModal(prev => ({ ...prev, saving: true, error: null }))
    try {
      if (richTextModal.tagId) {
        await fetch(`http://localhost:4000/api/project-tags/${richTextModal.tagId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_value: richTextModal.value })
        })
      } else {
        await fetch('http://localhost:4000/api/project-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_name: richTextModal.tagName, tag_value: richTextModal.value })
        })
      }
      fetchProjectTags()
      closeRichTextModal()
    } catch (err) {
      setRichTextModal(prev => ({ ...prev, saving: false, error: 'Failed to save tag' }))
    }
  }

  const deleteRichTextValue = async () => {
    if (!richTextModal.tagId) {
      return closeRichTextModal()
    }
    setRichTextModal(prev => ({ ...prev, saving: true, error: null }))
    try {
      await fetch(`http://localhost:4000/api/project-tags/${richTextModal.tagId}`, {
        method: 'DELETE'
      })
      fetchProjectTags()
      closeRichTextModal()
    } catch (err) {
      setRichTextModal(prev => ({ ...prev, saving: false, error: 'Failed to delete tag' }))
    }
  }

  const saveDateValue = async () => {
    setDateModal(prev => ({ ...prev, saving: true, error: null }))
    try {
      if (dateModal.tagId) {
        await fetch(`http://localhost:4000/api/project-tags/${dateModal.tagId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_value: dateModal.value })
        })
      } else {
        await fetch('http://localhost:4000/api/project-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_name: dateModal.tagName, tag_value: dateModal.value })
        })
      }
      fetchProjectTags()
      closeDateModal()
    } catch (err) {
      setDateModal(prev => ({ ...prev, saving: false, error: 'Failed to save tag' }))
    }
  }

  const deleteDateValue = async () => {
    if (!dateModal.tagId) {
      return closeDateModal()
    }
    setDateModal(prev => ({ ...prev, saving: true, error: null }))
    try {
      await fetch(`http://localhost:4000/api/project-tags/${dateModal.tagId}`, {
        method: 'DELETE'
      })
      fetchProjectTags()
      closeDateModal()
    } catch (err) {
      setDateModal(prev => ({ ...prev, saving: false, error: 'Failed to delete tag' }))
    }
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
                  onClick: () => { setSelectedDocument(doc); loadDocumentTags(doc.document_name) },
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
                  React.createElement('p', { style: { margin: '0', fontSize: '14px', wordWrap: 'break-word' } }, doc.document_name)
                )
              )
            )
          ),
          React.createElement('div', { style: { flex: 1, border: '1px solid #ccc', borderRadius: '6px', padding: '12px', overflowY: 'auto' } },
            React.createElement('h3', null, 'Document Details'),
            selectedDocument
              ? React.createElement(React.Fragment, null,
                  React.createElement('p', null, React.createElement('strong', null, 'Document Name: '), selectedDocument.document_name),
                  React.createElement('p', null, React.createElement('strong', null, 'Description: '), selectedDocument.document_description || 'No description'),
                  tagsLoading && React.createElement('p', null, 'Loading tags...'),
                  !tagsLoading && documentTags.length === 0 && React.createElement('p', { style: { color: '#999' } }, 'No tags found'),
                  !tagsLoading && documentTags.length > 0 && React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
                    React.createElement('thead', null,
                      React.createElement('tr', null,
                        React.createElement('th', { style: { textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd', fontWeight: 'bold' } }, 'Tag Name'),
                        React.createElement('th', { style: { textAlign: 'left', padding: '8px', borderBottom: '2px solid #ddd', fontWeight: 'bold' } }, 'Value')
                      )
                    ),
                    React.createElement('tbody', null,
                      documentTags.map(t => {
                        const projectTag = projectTags.find(pt => pt.tag_name === t.tag_name)
                        let value = projectTag && projectTag.tag_value !== null && projectTag.tag_value !== undefined && projectTag.tag_value !== ''
                          ? projectTag.tag_value
                          : 'empty'
                        
                        // Format date values
                        if (t.type === 'date' && value !== 'empty' && value) {
                          try {
                            const date = new Date(value)
                            const day = String(date.getDate()).padStart(2, '0')
                            const month = String(date.getMonth() + 1).padStart(2, '0')
                            const year = date.getFullYear()
                            value = `${day}/${month}/${year}`
                          } catch (e) {
                            // Keep original value if parsing fails
                          }
                        }
                        
                        // Format rich text values - strip HTML and truncate to 50 characters
                        if (t.type === 'rich_text' && value !== 'empty' && value) {
                          // Create a temporary element to strip HTML tags
                          const tempDiv = document.createElement('div')
                          tempDiv.innerHTML = value
                          const plainText = tempDiv.textContent || tempDiv.innerText || ''
                          value = plainText.substring(0, 50) + (plainText.length > 50 ? '...' : '')
                        }
                        
                        return React.createElement('tr', {
                          key: t.id,
                          style: { cursor: 'pointer' },
                          onDoubleClick: () => openTagModal(t)
                        },
                          React.createElement('td', { style: { padding: '8px', borderBottom: '1px solid #eee', textDecoration: 'underline' } }, t.tag_name),
                          React.createElement('td', { style: { padding: '8px', borderBottom: '1px solid #eee' } }, value)
                        )
                      })
                    )
                  )
                )
              : React.createElement('p', { style: { color: '#999' } }, 'Select a document to view details')
          )
        )
      )
    ),
    tagModal.open && React.createElement('div', {
      style: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
      }
    },
      React.createElement('div', {
        style: {
          backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '12px'
        }
      },
        React.createElement('h3', { style: { margin: 0 } }, `Edit Text Tag: ${tagModal.tagName}`),
        projectTagsLoading && React.createElement('p', { style: { color: '#666', margin: 0 } }, 'Refreshing tags...'),
        React.createElement('label', { style: { fontWeight: 'bold', fontSize: '14px' } }, 'Value'),
        React.createElement('input', {
          type: 'text',
          value: tagModal.value,
          onChange: (e) => setTagModal(prev => ({ ...prev, value: e.target.value })),
          style: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }
        }),
        tagModal.error && React.createElement('p', { style: { color: 'red', margin: 0 } }, tagModal.error),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' } },
          React.createElement('button', { onClick: closeTagModal, style: { padding: '8px 12px', cursor: 'pointer' }, disabled: tagModal.saving }, 'Cancel'),
          React.createElement('button', { onClick: deleteTagValue, style: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7' }, disabled: tagModal.saving }, tagModal.tagId ? 'Delete' : 'Discard'),
          React.createElement('button', { onClick: saveTagValue, style: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#0d6efd', color: '#fff', border: '1px solid #0b5ed7' }, disabled: tagModal.saving }, tagModal.tagId ? 'Save' : 'Create')
        )
      )
    ),
    
    richTextModal.open && React.createElement(RichTextModal, {
      richTextModal,
      projectTagsLoading,
      closeRichTextModal,
      deleteRichTextValue,
      saveRichTextValue,
      setRichTextModal
    }),
    
    dateModal.open && React.createElement('div', {
      style: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
      }
    },
      React.createElement('div', {
        style: {
          backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '12px'
        }
      },
        React.createElement('h3', { style: { margin: 0 } }, `Edit Date Tag: ${dateModal.tagName}`),
        projectTagsLoading && React.createElement('p', { style: { color: '#666', margin: 0 } }, 'Refreshing tags...'),
        React.createElement('label', { style: { fontWeight: 'bold', fontSize: '14px' } }, 'Value'),
        React.createElement('input', {
          type: 'date',
          value: dateModal.value,
          onChange: (e) => setDateModal(prev => ({ ...prev, value: e.target.value })),
          style: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }
        }),
        dateModal.error && React.createElement('p', { style: { color: 'red', margin: 0 } }, dateModal.error),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' } },
          React.createElement('button', { onClick: closeDateModal, style: { padding: '8px 12px', cursor: 'pointer' }, disabled: dateModal.saving }, 'Cancel'),
          React.createElement('button', { onClick: deleteDateValue, style: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f8d7da', border: '1px solid #f5c2c7' }, disabled: dateModal.saving }, dateModal.tagId ? 'Delete' : 'Discard'),
          React.createElement('button', { onClick: saveDateValue, style: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#0d6efd', color: '#fff', border: '1px solid #0b5ed7' }, disabled: dateModal.saving }, dateModal.tagId ? 'Save' : 'Create')
        )
      )
    )
  )
}

const root = document.getElementById('root')
ReactDOM.createRoot(root).render(React.createElement(React.StrictMode, null, React.createElement(App)))
