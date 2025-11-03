import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { URL } from '../../../url';

const ClientProgressViewed = () => {
  const { progressId } = useParams();
  const navigate = useNavigate();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found. Please log in.');

        const progressResponse = await axios.get(URL+`/api/progress/progress/${progressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const progressData = progressResponse.data;
        setProgress({
          id: progressData._id,
          media: progressData.media,
          division: progressData.division,
          progress: `${progressData.progress}%`,
          dateUpdated: new Date(progressData.dateUpdated).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          description: progressData.description,
          viewed: progressData.viewed,
        });

        setMessages(
          progressData.messages.map((msg, index) => ({
            ...msg,
            id: msg._id || index,
          })) || []
        );

        // Mark as viewed if client and not already viewed
        const user = JSON.parse(localStorage.getItem('user')) || {};
        if (user.role === 'Client' && !progressData.viewed) {
          await axios.post(
            URL+`/api/progress/progress/${progressId}/view`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Refresh unviewed count after marking as viewed
          const clientProjectsResponse = await axios.get(URL+'/api/progress/client/projects', {
            headers: { Authorization: `Bearer ${token}` },
            params: { clientId: user.id },
          });
          const totalUnviewed = clientProjectsResponse.data.totalUnviewed || 0;
          window.dispatchEvent(new CustomEvent('updateUnviewedCount', { detail: totalUnviewed }));
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [progressId]);

  const handleViewMedia = (media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    try {
      const response = await axios.post(
        URL+`/api/progress/progress/${progressId}/messages`,
        { text: feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(
        response.data.messages.map((msg, index) => ({
          ...msg,
          id: msg._id || index,
        }))
      );
      setFeedback('');
    } catch (error) {
      console.error('Error sending feedback:', error.response ? error.response.data : error.message);
      alert('Failed to send feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Loading progress details...</div>
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-red-500">Error: {error}</div>
      </div>
    );
  if (!progress)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">Progress not found</div>
      </div>
    );

  const currentMedia = progress.media[currentMediaIndex];
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserRole = user.role || 'Unknown';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8 pt-24 flex-grow w-full">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#002333] mb-4">{progress.division} Progress Details</h1>
            <div className="relative mx-auto" style={{ maxWidth: '600px' }}>
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt={`Progress Image ${currentMediaIndex + 1}`}
                  className="w-full h-96 object-cover rounded cursor-pointer"
                  onClick={() => handleViewMedia(currentMedia)}
                />
              ) : currentMedia.type === 'video' ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="w-full h-96 object-cover rounded cursor-pointer"
                  onClick={() => handleViewMedia(currentMedia)}
                />
              ) : null}
              {progress.media.length > 1 && (
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() =>
                      setCurrentMediaIndex((prev) => (prev - 1 + progress.media.length) % progress.media.length)
                    }
                    className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <span className="text-gray-700">{currentMediaIndex + 1} / {progress.media.length}</span>
                  <button
                    onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % progress.media.length)}
                    className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#002333] mb-4">Progress Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <strong>Progress:</strong> {progress.progress}
              </p>
              <p>
                <strong>Date Updated:</strong> {progress.dateUpdated}
              </p>
              <p>
                <strong>Description:</strong> {progress.description}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#002333] mb-4">Client Feedback</h2>
            <div className="h-64 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = currentUserRole === msg.sender?.text;
                  const messageClass = isCurrentUser
                    ? 'bg-blue-100 ml-auto text-right' // Current user (right-aligned)
                    : 'bg-green-100'; // Other user (left-aligned)

                  return (
                    <div
                      key={msg.id}
                      className={`mb-2 p-2 rounded-lg max-w-xs ${messageClass}`}
                    >
                      <p>
                        <strong>{msg.sender?.text || 'Unknown'}:</strong> {msg.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSendFeedback} className="flex gap-2">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded p-2 text-gray-700 focus:outline-none focus:border-blue-500"
                rows="3"
                placeholder="Type your feedback here..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Send
              </button>
            </form>
          </div>

          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 inline-block mr-2" /> Back
            </button>
          </div>
        </div>
      </div>
      <Footer />

      {isModalOpen && selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl w-full h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt="Zoomed Media"
                className="w-full h-full object-contain rounded"
              />
            ) : selectedMedia.type === 'video' ? (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain rounded"
              />
            ) : null}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProgressViewed;
