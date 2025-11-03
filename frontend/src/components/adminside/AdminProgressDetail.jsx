import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { URL } from '../../../url';

const ProgressDetail = () => {
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
        });

        setMessages(
          progressData.messages.map((msg, index) => ({
            ...msg,
            id: msg._id || index,
          })) || []
        );
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [progressId]);

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % progress.media.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + progress.media.length) % progress.media.length);
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
      const response = await axios.post(URL+`/api/progress/progress/${progressId}/messages`,
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

  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!progress) return <div className="p-8">Progress not found</div>;

  const currentMedia = progress.media[currentMediaIndex];
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserRole = user.role || 'Unknown';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem="projects" />
      <div className="flex-1 overflow-auto">
        <div className="p-8 bg-white m-4 rounded-lg shadow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">{progress.division} Progress Media</h1>
            <div className="relative mx-auto" style={{ maxWidth: '600px' }}>
              {currentMedia.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt={`Progress Image ${currentMediaIndex + 1}`}
                  className="w-full h-96 object-cover rounded cursor-pointer"
                  onClick={() => handleMediaClick(currentMedia)}
                />
              ) : currentMedia.type === 'video' ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="w-full h-96 object-cover rounded cursor-pointer"
                  onClick={() => handleMediaClick(currentMedia)}
                />
              ) : null}
              {progress.media.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <p className="text-center mt-2 text-gray-700">
                {currentMediaIndex + 1} / {progress.media.length}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Progress Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <strong>Progress:</strong> {progress.progress}
              </p>
              <p className="mb-2">
                <strong>Date Updated:</strong> {progress.dateUpdated}
              </p>
              <p>
                <strong>Description:</strong> {progress.description}
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Conversations</h2>
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
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </div>
        </div>

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
    </div>
  );
};

export default ProgressDetail;