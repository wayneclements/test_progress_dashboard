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

export default function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
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

  return (
    <div style={{padding: 20}}>
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
  )
}
