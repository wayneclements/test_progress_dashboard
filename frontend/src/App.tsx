import React, { useState, useEffect } from 'react'

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
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [projectTags, setProjectTags] = useState<ProjectTag[]>([])
  const [globalTags, setGlobalTags] = useState<GlobalTag[]>([])
  const [loading, setLoading] = useState(false)

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
    try {
      const response = await fetch(`http://localhost:4000/api/project-documents?projectName=${encodeURIComponent(projectName)}`)
      const data = await response.json()
      setDocuments(data)
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
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

  return (
    <div style={{padding: 20, display: 'flex', gap: 20}}>
      <div style={{flex: 1}}>
        <h1>Project Dashboard</h1>
        <div style={{marginBottom: 20}}>
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

        {selectedProject && (
          <div style={{border: '1px solid #ccc', padding: 20, borderRadius: 8}}>
            <h2>Documents for: {selectedProject}</h2>
            {loading ? (
              <p>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p style={{color: '#666'}}>No documents found for this project.</p>
            ) : (
              <ul style={{listStyle: 'none', padding: 0}}>
                {documents.map((doc) => (
                  <li 
                    key={doc.id} 
                    style={{
                      padding: 12,
                      borderBottom: '1px solid #eee',
                      fontSize: 16
                    }}
                  >
                    {doc.document_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div style={{width: 400, borderLeft: '2px solid #ccc', paddingLeft: 20}}>
        <h2>Project Tags</h2>
        <p style={{fontSize: 14, color: '#666', marginBottom: 15}}>
          Double-click a tag to edit its value
        </p>
        {projectTags.length === 0 ? (
          <p style={{color: '#666'}}>No project tags found.</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {projectTags.map((tag) => (
              <button
                key={tag.id}
                onDoubleClick={() => handleTagDoubleClick(tag)}
                style={{
                  padding: 12,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  backgroundColor: '#e6f0ff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d2e4ff'
                  e.currentTarget.style.borderColor = '#999'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f0ff'
                  e.currentTarget.style.borderColor = '#ccc'
                }}
              >
                <div style={{fontWeight: 'bold', fontSize: 14, marginBottom: 4}}>
                  {tag.tag_name}
                </div>
                <div style={{fontSize: 14, color: '#555'}}>
                  {tag.tag_value || <span style={{fontStyle: 'italic', color: '#999'}}>No value</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
