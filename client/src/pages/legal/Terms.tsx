import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../../api';

const Terms: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await settingsAPI.getAll();
        setContent(data.terms || '');
      } catch (err) {
        console.error('Failed to fetch terms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 prose prose-gray">
      <div 
        className="dynamic-content"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      {!content && <p className="text-gray-500 italic">No terms and conditions have been published yet.</p>}
    </div>
  );
};

export default Terms;
