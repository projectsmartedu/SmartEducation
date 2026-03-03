import React, { useEffect, useState } from 'react';
import MindMap from '../components/MindMap';
import axios from 'axios';

export default function StudentMindMapPage() {
  const [data, setData] = useState(null);
  const studentId = 'demo-student-id'; // TODO: get from auth context

  useEffect(() => {
    axios.get(`/api/mindmap/${studentId}`)
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, [studentId]);

  return (
    <div>
      <h1>Knowledge Mind Map</h1>
      {data ? <MindMap data={data} /> : <p>Loading mind map...</p>}
    </div>
  );
}
