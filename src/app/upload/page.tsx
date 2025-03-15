import React from 'react';
import TaskUpload from '../../pages/uploadCSV'; // Adjust path if needed

function Page() {
  // Define fetchTasks function
  const fetchTasks = async () => {
    console.log("Fetching tasks...");
    // Add API call or task refresh logic here
  };

  return (
    <div>
      <TaskUpload fetchTasks={fetchTasks} />
    </div>
  );
}

export default Page;
