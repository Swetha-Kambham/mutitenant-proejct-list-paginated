import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_PROJECTS, GET_ME } from '../graphql/queries';
import { LOGOUT_MUTATION } from '../graphql/mutations';
import { ProjectPage, LogoutResult, User } from '../types';
import { ProjectTable } from '../components/ProjectTable';
import { Pagination } from '../components/Pagination';
import { SearchBox } from '../components/SearchBox';

export function Projects() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  const { data: meData } = useQuery<{ me: User }>(GET_ME, {
    onError: () => {
      navigate('/login');
    },
  });

  const { data, loading, error } = useQuery<{ projects: ProjectPage }>(GET_PROJECTS, {
    variables: {
      page,
      pageSize,
      search: searchTerm || undefined,
    },
    fetchPolicy: 'network-only',
    onError: (err) => {
      if (err.message.includes('Unauthorized') || err.message.includes('authenticated')) {
        navigate('/login');
      }
    },
  });

  const [logout] = useMutation<{ logout: LogoutResult }>(LOGOUT_MUTATION, {
    onCompleted: () => {
      navigate('/login');
    },
    onError: () => {
      navigate('/login');
    },
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLogout = () => {
    logout();
  };

  if (error && !error.message.includes('Unauthorized')) {
    return (
      <div className="error-container">
        <h2>Error loading projects</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="header-left">
          <h1>Project List</h1>
          {meData?.me && (
            <div className="user-info">
              <span className="tenant-badge">{meData.me.tenantSlug}</span>
              <span className="user-name">{meData.me.username}</span>
              <span className="user-role">({meData.me.role})</span>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="controls-bar">
        <SearchBox onSearch={handleSearch} disabled={loading} />
        {data?.projects && (
          <div className="results-count">
            {data.projects.totalCount} project{data.projects.totalCount !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : data?.projects ? (
        <>
          <ProjectTable projects={data.projects.data} />
          {data.projects.totalPages > 1 && (
            <Pagination
              currentPage={data.projects.page}
              totalPages={data.projects.totalPages}
              hasNextPage={data.projects.hasNextPage}
              hasPreviousPage={data.projects.hasPreviousPage}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
