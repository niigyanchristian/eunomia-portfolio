import './ProjectCard.css'

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
}

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const truncatedDescription =
    project.description && project.description.length > 150
      ? project.description.substring(0, 150) + '…'
      : project.description || ''

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-card-title">{project.title}</h3>
        <span className={`status-badge status-${project.status}`}>
          {STATUS_LABELS[project.status] || project.status}
        </span>
      </div>

      {truncatedDescription && (
        <p className="project-card-description">{truncatedDescription}</p>
      )}

      <div className="project-card-meta">
        {project.category && (
          <span className="category-badge">{project.category}</span>
        )}
        {project.projectType && (
          <span className="project-type">{project.projectType}</span>
        )}
      </div>

      {project.customTags && project.customTags.length > 0 && (
        <div className="project-card-tags">
          {project.customTags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      )}

      <div className="project-card-actions">
        <button
          className="btn-card-edit"
          onClick={() => onEdit(project)}
          aria-label={`Edit ${project.title}`}
        >
          Edit
        </button>
        <button
          className="btn-card-delete"
          onClick={() => onDelete(project)}
          aria-label={`Delete ${project.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
