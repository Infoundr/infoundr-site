import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddStartupButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/accelerator/invites'); // ✅ Redirect to SendInvites page
  };

  return (
    <button
      onClick={handleClick}
      className="ml-auto px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition"
    >
      + Add New Startup
    </button>
  );
};

export default AddStartupButton;
