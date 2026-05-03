import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIDesign() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/hvac', { replace: true }); }, []);
  return null;
}