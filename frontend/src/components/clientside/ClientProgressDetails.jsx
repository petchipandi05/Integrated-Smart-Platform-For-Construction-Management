import React, { useState, useEffect } from 'react';
import { Building2, ArrowLeft, Eye } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { URL } from '../../../url';

const ClientProgressDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view progress updates.');
          setLoading(false);
          return;
        }

        const response = await axios.get(URL+`/api/progress/${id}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('API Response:', response.data); // Debug the response
        setProgressUpdates(response.data.progressUpdates || []);
        setUnviewedCount(response.data.unviewedCount || 0);
      } catch (err) { 
        setError(err.response?.data?.message || 'Failed to fetch progress updates.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [id]);

  const handleViewMedia = async (progressId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        URL+`/api/progress/progress/${progressId}/view`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update local state to mark progress as viewed
      setProgressUpdates((prevUpdates) =>
        prevUpdates.map((update) =>
          update._id === progressId ? { ...update, viewed: true } : update
        )
      );
      setUnviewedCount((prev) => Math.max(0, prev - 1));
      navigate(`/clientdashboard/progress/viewed/${progressId}`);
    } catch (err) {
      console.error('Error marking progress as viewed:', err);
      setError(err.response?.data?.message || 'Failed to mark progress as viewed.');
    }
  };

  const getFirstImageUrl = (mediaArray) => {
    if (!mediaArray || mediaArray.length === 0) return null;
    const firstImage = mediaArray.find((media) => media.type === 'image');
    return firstImage ? firstImage.url : null;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Loading progress updates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  if (progressUpdates.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-8 pt-24 flex-grow">
          <button
            onClick={() => navigate(`/clientdashboard/projects/${id}`)}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6 ml-auto"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Project Details
          </button>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600">No progress updates available.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8 pt-24 flex-grow w-full">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#002333]">Progress Updates</h2>
            {unviewedCount > 0 && (
              <span className="text-red-500 text-sm">Unviewed: {unviewedCount}</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressUpdates.map((update) => {
              const firstImageUrl = getFirstImageUrl(update.media);
              return (
                <div
                  key={update._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  {firstImageUrl ? (
                    <img
                      src={firstImageUrl}
                      alt={`Progress Media for ${update.division}`}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                  {!update.viewed && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-[#002333] mb-2 truncate">
                      {update.division}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Progress:</strong> {update.progress}%
                      </p>
                      <p>
                        <strong>Date Updated:</strong>{' '}
                        {new Date(update.dateUpdated).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p>
                        <strong>Description:</strong> {update.description || 'N/A'}
                      </p>
                    </div>
                    {update.media && update.media.length > 0 && (
                      <button
                        onClick={() => handleViewMedia(update._id)}
                        className="mt-4 w-full flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="w-5 h-5" /> View Media
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => navigate(`/clientdashboard/projects/${id}`)}
          className="mt-6 ml-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default ClientProgressDetails;