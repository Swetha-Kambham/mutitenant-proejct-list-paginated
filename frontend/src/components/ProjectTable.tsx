import { Project } from '../types';

interface ProjectTableProps {
  projects: Project[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'active' || normalizedStatus === 'in progress') {
      return 'status-active';
    }
    if (normalizedStatus === 'completed') {
      return 'status-completed';
    }
    if (normalizedStatus === 'on hold') {
      return 'status-onhold';
    }
    return 'status-default';
  };

  if (projects.length === 0) {
    return (
      <div className="no-results">
        <p>No projects found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="project-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td className="project-name">{project.name}</td>
              <td className="project-description">
                {project.description || '—'}
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
              </td>
              <td>{formatDate(project.createdAt)}</td>
              <td>{formatDate(project.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
