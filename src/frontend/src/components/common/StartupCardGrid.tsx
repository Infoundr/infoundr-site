import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listStartups } from '../../services/startups';
import StartupCard, { StartupCardProps } from './StartupCard';
import StartupSearchBar from './StartupSearchBar';
import StartupPagination from './StartupPagination';

const ITEMS_PER_PAGE = 6;

const StartupCardGrid: React.FC = () => {
  const [startups, setStartups] = useState<StartupCardProps[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const handlePageChange = (page: number) => setCurrentPage(page);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const { items, total } = await listStartups({}, '');

        const mapped = items.map((startup) => ({
          name: startup.name,
          description: startup.description ?? 'No description',
          status: startup.status_id as 'Active' | 'Graduated' | 'Invited',
          joined: new Date(startup.date_joined).toLocaleDateString(),
          cohort: startup.cohort_id ?? 'Unknown Cohort',
          engagement: startup.engagement_score ?? 0,
          avatarUrl: '/icons/company.png',
          members: ['/icons/avatar1.png', '/icons/avatar2.png'],
        }));

        setStartups(mapped);
        setTotal(total);
      } catch (error) {
        console.error('Failed to fetch startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const paginatedStartups = startups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(startups.length / ITEMS_PER_PAGE);

  return (
    <div>
      <StartupSearchBar startups={startups} total={total} />

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Loading startups...</p>
      ) : startups.length === 0 ? (
        <div className="text-center mt-10 text-gray-700">
          <p className="mb-4">No startups found.</p>
          <Link
            to="/Accelerator/Invites"
            className="text-purple-600 font-semibold hover:underline"
          >
            Click here to add a new one
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end my-4">
            <Link
              to="/Accelerator/Invites"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Add New Startup
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {paginatedStartups.map((startup, idx) => (
              <Link
                to={`/accelerator/startups/${encodeURIComponent(startup.name)}`}
                key={idx}
              >
                <StartupCard {...startup} />
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <StartupPagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StartupCardGrid;
