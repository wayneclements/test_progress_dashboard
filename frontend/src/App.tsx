import React, { useEffect, useMemo, useState } from 'react'

interface Project {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface ProjectDocument {
  id: number
  project_name: string
  document_name: string
  document_description: string
  created_at: string
}

interface ProjectTag {
  id: number
  tag_name: string
  tag_value: string
  created_at: string
}

interface GlobalTag {
  id: number
  name: string
  type: string
  created_at: string
  columns?: string
}

interface DocumentTag {
  id: number
  tag_name: string
  document_name: string
  created_at: string
  type?: string
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [selectedDocument, setSelectedDocument] = useState<string>('')
  const [projectTags, setProjectTags] = useState<ProjectTag[]>([])
  const [globalTags, setGlobalTags] = useState<GlobalTag[]>([])
  const [documentTags, setDocumentTags] = useState<DocumentTag[]>([])
  const [loading, setLoading] = useState(false)
  const [editTableModal, setEditTableModal] = useState<{ isOpen: boolean; tag: ProjectTag | null }>({ isOpen: false, tag: null })

  useEffect(() => {
    fetchProjects()
    fetchProjectTags()
    fetchGlobalTags()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchDocuments(selectedProject)
    } else {
      setDocuments([])
      setDocumentTags([])
      setSelectedDocument('')
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/projects')
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }

  const fetchDocuments = async (projectName: string) => {
    setLoading(true)
    setDocumentTags([])
    setSelectedDocument('')
    try {
      const response = await fetch(`http://localhost:4000/api/project-documents?projectName=${encodeURIComponent(projectName)}`)
      const data = await response.json()
      setDocuments(data)
      await fetchDocumentTagsForDocuments(data)
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentTagsForDocuments = async (docs: ProjectDocument[]) => {
    if (docs.length === 0) {
      setDocumentTags([])
      return
    }

    try {
      const tagResults = await Promise.all(
        docs.map(async (doc) => {
          const response = await fetch(
            `http://localhost:4000/api/document-tags?documentName=${encodeURIComponent(doc.document_name)}`
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch document tags for ${doc.document_name}`)
          }

          const data = await response.json()
          return data as DocumentTag[]
        })
      )

      setDocumentTags(tagResults.flat())
    } catch (err) {
      console.error('Error fetching document tags:', err)
      setDocumentTags([])
    }
  }

  const fetchProjectTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/project-tags')
      const data = await response.json()
      setProjectTags(data)
    } catch (err) {
      console.error('Error fetching project tags:', err)
    }
  }

  const documentTagsByName = useMemo(() => {
    const map = new Map<string, DocumentTag>()
    documentTags.forEach((tag) => {
      if (!map.has(tag.tag_name)) {
        map.set(tag.tag_name, tag)
      }
    })
    return Array.from(map.values())
  }, [documentTags])

  const fetchGlobalTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/global-tags')
      const data = await response.json()
      setGlobalTags(data)
    } catch (err) {
      console.error('Error fetching global tags:', err)
    }
  }

  const handleTagDoubleClick = async (tag: ProjectTag) => {
    const globalTag = globalTags.find(gt => gt.name === tag.tag_name)
    const tagType = globalTag?.type || 'text'
    
    if (tagType === 'table') {
      setEditTableModal({ isOpen: true, tag })
      return
    }
    
    const newValue = prompt(`Edit ${tag.tag_name} (type: ${tagType}):`, tag.tag_value || '')
    
    if (newValue !== null && newValue !== tag.tag_value) {
      try {
        const response = await fetch(`http://localhost:4000/api/project-tags/${tag.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tag_value: newValue })
        })
        
        if (response.ok) {
          // Refresh project tags
          await fetchProjectTags()
        } else {
          const error = await response.json()
          alert(`Error updating tag: ${error.error}`)
        }
      } catch (err) {
        console.error('Error updating tag:', err)
        alert('Failed to update tag')
      }
    }
  }

  const handleTableModalSave = async (newValue: string) => {
    if (!editTableModal.tag) return
    
    if (newValue !== editTableModal.tag.tag_value) {
      try {
        const response = await fetch(`http://localhost:4000/api/project-tags/${editTableModal.tag.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tag_value: newValue })
        })
        
        if (response.ok) {
          await fetchProjectTags()
          setEditTableModal({ isOpen: false, tag: null })
        } else {
          const error = await response.json()
          alert(`Error updating tag: ${error.error}`)
        }
      } catch (err) {
        console.error('Error updating tag:', err)
        alert('Failed to update tag')
      }
    } else {
      setEditTableModal({ isOpen: false, tag: null })
    }
  }

  const handleTableModalClose = () => {
    setEditTableModal({ isOpen: false, tag: null })
  }

  return (
    <div style={{padding: 20, height: '100vh', display: 'flex', flexDirection: 'column', gap: 20}}>
      <div>
        <h1 style={{margin: 0, marginBottom: 20}}>Project Dashboard</h1>
        <div>
          <label htmlFor="project-select" style={{marginRight: 10, fontWeight: 'bold'}}>
            Select Project:
          </label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{padding: 8, fontSize: 16, minWidth: 300}}
          >
            <option value="">-- Select a project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.name}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <div style={{flex: 1, display: 'flex', gap: 20, overflow: 'hidden'}}>
          {/* Left Panel - Document List */}
          <div style={{width: 300, borderRight: '2px solid #ccc', paddingRight: 20, overflowY: 'auto'}}>
            <h2 style={{marginTop: 0}}>Documents</h2>
            {loading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p style={{color: '#666'}}>No documents found.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc.document_name)}
                    style={{
                      padding: 12,
                      border: '1px solid #ccc',
                      borderRadius: 6,
                      backgroundColor: selectedDocument === doc.document_name ? '#007acc' : '#f5f5f5',
                      color: selectedDocument === doc.document_name ? 'white' : 'black',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDocument !== doc.document_name) {
                        e.currentTarget.style.backgroundColor = '#e0e0e0'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDocument !== doc.document_name) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }
                    }}
                  >
                    {doc.document_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Panel - Document Details */}
          <div style={{flex: 1, overflowY: 'auto', padding: 20}}>
            {selectedDocument ? (
              <div>
                <h2 style={{marginTop: 0}}>Document: {selectedDocument}</h2>
                <div style={{marginTop: 20}}>
                  <h3 style={{color: '#666', fontSize: 16, marginBottom: 8}}>Description:</h3>
                  <p style={{fontSize: 14, lineHeight: 1.6}}>
                    {documents.find(d => d.document_name === selectedDocument)?.document_description || 'No description available'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999'}}>
                <p>Select a document from the left panel</p>
              </div>
            )}
          </div>

          {/* Right Panel - Document Tags */}
          <div style={{width: 400, borderLeft: '2px solid #ccc', paddingLeft: 20, overflowY: 'auto'}}>
            <h2 style={{marginTop: 0}}>Document Tags</h2>
            <p style={{fontSize: 14, color: '#666', marginBottom: 15}}>
              Showing tag_name from document_tags and tag_value from project_tags (if present)
            </p>
            {documentTagsByName.length === 0 ? (
              <p style={{color: '#666'}}>No document tags found for this project.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {documentTagsByName.map((tag) => {
                  const matchingProjectTag = projectTags.find((pt) => pt.tag_name === tag.tag_name)
                  const tagValue = matchingProjectTag?.tag_value
                  const isEditable = Boolean(matchingProjectTag)

                  return (

      {/* Edit Table Modal */}
      {editTableModal.isOpen && editTableModal.tag && (
        <EditTableModal
          tag={editTableModal.tag}
          globalTag={globalTags.find(gt => gt.name === editTableModal.tag!.tag_name)}
          onSave={handleTableModalSave}
          onClose={handleTableModalClose}
        />
      )}
    </div>
  )
}

interface EditTableModalProps {
  tag: ProjectTag
  globalTag?: GlobalTag
  onSave: (value: string) => void
  onClose: () => void
}

function EditTableModal({ tag, globalTag, onSave, onClose }: EditTableModalProps) {
  const [tableData, setTableData] = useState<Array<Record<string, string>>>(
    tag.tag_value ? JSON.parse(tag.tag_value) : []
  )

  const columns = globalTag?.columns?.split(',').map(c => c.trim()) || []

  const handleAddRow = () => {
    const newRow: Record<string, string> = {}
    columns.forEach(col => {
      newRow[col] = ''
    })
    setTableData([...tableData, newRow])
  }

  const handleDeleteRow = (index: number) => {
    setTableData(tableData.filter((_, i) => i !== index))
  }

  const handleCellChange = (rowIndex: number, colName: string, value: string) => {
    const newData = [...tableData]
    newData[rowIndex][colName] = value
    setTableData(newData)
  }

  const handleSave = () => {
    onSave(JSON.stringify(tableData))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 30,
        maxWidth: 900,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <h2 style={{margin: 0}}>Edit Table</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ×
          </button>
        </div>

        {columns.length === 0 ? (
          <p style={{color: '#666'}}>No columns defined for this table tag.</p>
        ) : (
          <>
            <div style={{overflowX: 'auto', marginBottom: 20}}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #ddd'
              }}>
                <thead>
                  <tr style={{backgroundColor: '#f5f5f5'}}>
                    <th style={{padding: 10, border: '1px solid #ddd', textAlign: 'left'}}>Action</th>
                    {columns.map((col) => (
                      <th key={col} style={{padding: 10, border: '1px solid #ddd', textAlign: 'left'}}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td style={{padding: 10, border: '1px solid #ddd'}}>
                        <button
                          onClick={() => handleDeleteRow(rowIndex)}
                          style={{
                            background: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          Delete
                        </button>
                      </td>
                      {columns.map((col) => (
                        <td key={col} style={{padding: 10, border: '1px solid #ddd'}}>
                          <input
                            type="text"
                            value={row[col] || ''}
                            onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              border: '1px solid #ddd',
                              borderRadius: 4,
                              fontSize: 14
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{display: 'flex', gap: 10, marginBottom: 20}}>
              <button
                onClick={handleAddRow}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                + Add Row
              </button>
            </div>
          </>
        )}

        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20}}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ccc',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Save
          </button>
        </div>
      </div>
                    <button
                      key={tag.tag_name}
                      onDoubleClick={() => matchingProjectTag && handleTagDoubleClick(matchingProjectTag)}
                      disabled={!isEditable}
                      style={{
                        padding: 12,
                        border: '1px solid #ccc',
                        borderRadius: 6,
                        backgroundColor: isEditable ? '#e6f0ff' : '#f5f5f5',
                        cursor: isEditable ? 'pointer' : 'not-allowed',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        opacity: isEditable ? 1 : 0.7
                      }}
                      onMouseEnter={(e) => {
                        if (!isEditable) return
                        e.currentTarget.style.backgroundColor = '#d2e4ff'
                        e.currentTarget.style.borderColor = '#999'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isEditable ? '#e6f0ff' : '#f5f5f5'
                        e.currentTarget.style.borderColor = '#ccc'
                      }}
                      title={isEditable ? 'Double-click to edit project tag value' : 'No project tag value to edit'}
                    >
                      <div style={{fontWeight: 'bold', fontSize: 14, marginBottom: 4}}>
                        {tag.tag_name}
                      </div>
                      <div style={{fontSize: 14, color: '#555'}}>
                        {tagValue || <span style={{fontStyle: 'italic', color: '#999'}}>No value</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
